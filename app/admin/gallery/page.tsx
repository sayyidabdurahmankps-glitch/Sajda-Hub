"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { UploadCloud, X, Loader2, ImagePlus, Tag, CheckCircle, AlertTriangle, ShieldCheck, Hash, Trash2 } from 'lucide-react';
import { PageHeader } from "../components/ui";

type UploadQueueItem = {
  id: string, file: File, preview: string, progress: number
  status: 'queued' | 'compressing' | 'uploading' | 'success' | 'error'
}

type ProgramData = { id: string, title: string, wing_key: string }
type Asset = { id: string, image_url: string, title: string }

export default function GalleryStudioPage() {
  // Upload State
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [globalCategory, setGlobalCategory] = useState<string>('General');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery Manager State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Fetch Programs for Tagging & Existing Gallery Assets
  const loadData = async () => {
    // Fetch Programs for the dropdown
    const { data: progData } = await supabase
      .from('programs')
      .select('id, title, wing_key')
      .eq('status', 'active')
      .order('event_date', { ascending: false });
    if (progData) setPrograms(progData);

    // Fetch existing gallery images
    const { data: galleryData } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    if (galleryData) setAssets(galleryData);
    
    setLoadingAssets(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Queue Management
  const addFilesToQueue = (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadQueueItem[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).substring(2, 9), 
        file, 
        preview: URL.createObjectURL(file), 
        status: 'queued', 
        progress: 0
      }));
    setUploadQueue(prev => [...prev, ...newItems]);
  };

  const removeFile = (id: string, preview: string) => {
    URL.revokeObjectURL(preview); 
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  // 3. Client-Side Canvas Compression[cite: 5]
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = (ev) => {
        const img = new Image(); img.src = ev.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height; const MAX = 2000;
          if (w > h && w > MAX) { h *= MAX / w; w = MAX; } 
          else if (h > MAX) { w *= MAX / h; h = MAX; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject("Canvas failure");
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject("Blob failed"), 'image/jpeg', 0.8);
        }
      }; reader.onerror = (err) => reject(err);
    });
  };

  // 4. Batch Upload to Cloudinary & Supabase[cite: 5]
  const processAndUpload = async () => {
    if (uploadQueue.length === 0) return alert("System Error: No files in queue.");
    setIsProcessing(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

    for (const item of uploadQueue) {
      if (item.status === 'success') continue;
      
      // Step 1: Compress
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'compressing', progress: 20 } : q));
      
      try {
        const compressedBlob = await compressImage(item.file);
        
        // Step 2: Upload to Cloudinary
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading', progress: 60 } : q));
        
        const formData = new FormData();
        formData.append("file", compressedBlob);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const cloudData = await res.json();
        if (!cloudData.secure_url) throw new Error("Cloudinary upload failed");

        // Step 3: Save to Database
        const selectedProgram = programs.find(p => p.id === selectedProgramId);
        const dynamicTitle = selectedProgram 
          ? `[${globalCategory}] ${selectedProgram.title}` 
          : `[${globalCategory}] Gallery Moment`;

        const { error: dbError } = await supabase.from('gallery').insert([{
          image_url: cloudData.secure_url, 
          title: dynamicTitle,
          status: 'active'
        }]);
        
        if (dbError) throw dbError;

        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success', progress: 100 } : q));
        URL.revokeObjectURL(item.preview);

      } catch (err) {
        console.error("Upload failed:", err);
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', progress: 0 } : q));
      }
    }
    
    setIsProcessing(false);
    await loadData(); // Refresh the gallery grid
  };

  // 5. Delete Asset[cite: 6]
  const deleteAsset = async (asset: Asset) => {
    if (!confirm(`Permanently remove "${asset.title}" from the gallery?`)) return;
    setDeletingId(asset.id);
    try {
      // Note: Frontend cannot delete from Cloudinary for security reasons. 
      // This deletes the database record so it disappears from the website.
      const { error: dbError } = await supabase.from('gallery').delete().eq('id', asset.id);
      if (dbError) throw dbError;
      setAssets(prev => prev.filter(a => a.id !== asset.id));
    } catch (error: any) {
      alert("Deletion Failed: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Gallery Studio"
        description="High-volume asset ingestion and media management engine."
      />

      <div className="animate-in fade-in duration-700">
        
        {/* ==========================================
            TAGGING METADATA
        =========================================== */}
        <div className="bg-[#0a1725] border border-white/5 p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-ocean-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <label className="text-xs font-black uppercase text-white/40 tracking-widest mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400"/> Batch Category
            </label>
            <select 
              value={globalCategory} 
              onChange={e => setGlobalCategory(e.target.value)} 
              className="w-full bg-black/40 border border-white/10 text-white font-black py-4 px-5 rounded-2xl outline-none focus:border-amber-400/50 uppercase cursor-pointer text-xs tracking-widest transition-colors"
            >
              <option value="General">General / Other</option>
              <option value="Stage">Stage Performance</option>
              <option value="Crowd">Crowd / Candid</option>
              <option value="Awards">Awards Ceremony</option>
              <option value="Campus">Campus Life</option>
            </select>
          </div>

          <div className="relative z-10">
            <label className="text-xs font-black uppercase text-white/40 tracking-widest mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400"/> Link to Program (Optional)
            </label>
            <select 
              value={selectedProgramId} 
              onChange={e => setSelectedProgramId(e.target.value)} 
              className="w-full bg-black/40 border border-white/10 text-white font-black py-4 px-5 rounded-2xl outline-none focus:border-amber-400/50 uppercase cursor-pointer text-xs tracking-widest transition-colors"
            >
              <option value="">-- No Specific Program --</option>
              {programs.map(p => <option key={p.id} value={p.id}>[{p.wing_key}] {p.title}</option>)}
            </select>
          </div>
        </div>

        {/* ==========================================
            DROPZONE
        =========================================== */}
        <div 
          onClick={() => fileInputRef.current?.click()} 
          className="h-40 border-2 border-amber-400/30 border-dashed rounded-[2rem] bg-black/20 hover:border-amber-400 hover:bg-[#0a1725] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group mb-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-amber-400/0 group-hover:bg-amber-400/5 transition-colors duration-500" />
          <input type="file" multiple ref={fileInputRef} onChange={e => addFilesToQueue(e.target.files)} accept="image/*" className="hidden" />
          <ImagePlus className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform duration-500 relative z-10" />
          <p className="font-black text-white text-lg tracking-tight relative z-10">Drop Photos Here</p>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest relative z-10">Select multiple files for batch upload</p>
        </div>

        {/* ==========================================
            TRANSMISSION QUEUE
        =========================================== */}
        {uploadQueue.length > 0 && (
          <div className="bg-[#0a1725] border border-white/5 p-6 rounded-[2rem] mb-12 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Upload Queue</h2>
              <p className="text-xs font-mono text-amber-400">{uploadQueue.length} files loaded</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {uploadQueue.map((item) => (
                <div key={item.id} className="bg-black/50 border border-white/5 rounded-2xl p-2.5 relative group hover:border-amber-400/30 transition-colors">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10 mb-2">
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 font-black uppercase text-[8px] tracking-widest border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                      {item.status === 'success' && <CheckCircle className="w-3 h-3 text-emerald-400"/>}
                      {item.status === 'uploading' && <Loader2 className="w-3 h-3 text-ocean-400 animate-spin"/>}
                      {item.status === 'compressing' && <Loader2 className="w-3 h-3 text-amber-400 animate-spin"/>}
                      {item.status === 'error' && <AlertTriangle className="w-3 h-3 text-red-500"/>}
                      <span className={item.status === 'success' ? 'text-emerald-400' : 'text-zinc-300'}>{item.status}</span>
                    </div>

                    {(item.status === 'queued' || item.status === 'error') && (
                      <button onClick={() => removeFile(item.id, item.preview)} className="absolute bottom-2 right-2 p-1.5 bg-black/80 rounded-lg border border-white/10 hover:bg-red-500 hover:border-red-500 transition-all group/btn">
                        <X className="w-3 h-3 text-white/50 group-hover/btn:text-white" />
                      </button>
                    )}
                  </div>
                  
                  <p className="font-bold text-white/40 text-[9px] truncate px-1 mb-2 uppercase tracking-widest">{item.file.name}</p>
                  
                  {item.status !== 'queued' && item.status !== 'success' && (
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                  {item.status === 'success' && (
                    <div className="text-emerald-400 font-black text-[8px] uppercase tracking-widest text-center bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/20">
                      Uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center border-t border-white/5 pt-6">
              <button 
                onClick={processAndUpload} 
                disabled={isProcessing} 
                className="bg-ocean-600 text-white font-black uppercase tracking-[0.2em] text-xs py-4 px-10 rounded-xl hover:bg-ocean-500 transition-all shadow-[0_0_20px_rgba(7,90,138,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <>Start Upload Batch <UploadCloud className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            ASSET MANAGER GRID
        =========================================== */}
        <div className="mt-16">
          <div className="mb-8 border-b border-white/10 pb-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Manage Gallery</h2>
              <p className="text-white/40 font-mono text-[10px] uppercase mt-2 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400" /> Deletions remove images from public view.
              </p>
            </div>
          </div>

          {loadingAssets ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-400 w-8 h-8" /></div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/30 font-bold text-sm">No images in the gallery yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map(asset => (
                <div key={asset.id} className="bg-[#0a1725] border border-white/5 rounded-2xl p-3 flex flex-col group hover:border-white/20 transition-all">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black mb-3 border border-white/5">
                    <img src={asset.image_url} alt="thumbnail" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex justify-between items-start gap-2 px-1">
                    <p className="font-bold text-white text-xs line-clamp-2 leading-snug flex-1">
                      {asset.title}
                    </p>
                    <button 
                      onClick={() => deleteAsset(asset)} 
                      disabled={deletingId === asset.id}
                      className="w-8 h-8 shrink-0 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                    >
                      {deletingId === asset.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}