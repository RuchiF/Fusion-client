import React, { useState } from "react";
import InboxTable from "../../components/tables/InboxTable";
import { getLtcInbox } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFetchData from "../../hooks/useFetchData";

function LtcInbox() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data, loading, error } = useFetchData(() => getLtcInbox(), [refreshTrigger]);

  const handleApprovalComplete = () => {
    // Trigger a refresh of the inbox data
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return <InboxTable title="LTC Inbox" data={data} formType="ltc" onApprovalComplete={handleApprovalComplete} />;
}

export default LtcInbox;
