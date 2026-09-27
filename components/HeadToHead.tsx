useEffect(() => {
    const fetchUnions = async () => {
      // Look how much simpler this query is now!
      const { data, error } = await supabase
        .from('union_metrics')
        .select(`union_id, union_name, dawa_score, adarsham_score, sargam_score, publishing_score, total_score`);

      if (error) {
        console.error("Supabase Error:", error);
      } else if (data) {
        const formattedData = data.map((item: any) => ({
          union_id: item.union_id,
          name: item.union_name || "Unknown Union", // Maps directly from the view
          dawa: item.dawa_score || 0,
          adarsham: item.adarsham_score || 0,
          sargam: item.sargam_score || 0,
          publishing: item.publishing_score || 0,
          total: item.total_score || 0,
        }));
        setUnionsList(formattedData);
      }
      setIsLoading(false);
    };

    fetchUnions();
  }, []);