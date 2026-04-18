import React, { useState } from "react";
import { Title, Modal, Textarea, Button, Flex } from "@mantine/core";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // Use for navigation
import { Eye, MapPin, Check, X } from "@phosphor-icons/react";
import "../../styles/Table.css"; // Ensure this path is correct
import { EmptyTable } from "./EmptyTable";
import { approveLtcForm, rejectLtcForm } from "../../services/api";

function InboxTable({ title, data, formType, onApprovalComplete }) {
  const navigate = useNavigate();
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [selectedItemForRejection, setSelectedItemForRejection] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleViewClick = (id) => {
    const viewUrlMap = {
      leave: `/hr/leave/file_handler/${id}`, // Leave has a file handler
      cpda_adv: `/hr/cpda_adv/view/${id}`,
      ltc: `/hr/ltc/view/${id}`,
      cpda_claim: `/hr/cpda_claim/view/${id}`,
      appraisal: `/hr/appraisal/view/${id}`,
    };

    navigate(viewUrlMap[formType] || `/hr/FormView/${formType}_track/${id}`); // Fallback
  };

  const handleTrackClick = (id) => {
    const trackUrlMap = {
      leave: `/hr/FormView/leaveform_track/${id}`,
      cpda_adv: `/hr/FormView/cpda_adv_track/${id}`,
      ltc: `/hr/FormView/ltc_track/${id}`,
      cpda_claim: `/hr/FormView/cpda_claim_track/${id}`,
      appraisal: `/hr/FormView/appraisal_track/${id}`,
    };

    navigate(trackUrlMap[formType]); // Default to leaveform_track if formType is not matched
  };

  const handleApprove = async (item) => {
    if (formType !== "ltc") {
      alert("Approval workflow not yet implemented for this form type");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // For LTC, forward to Accountant after HR Admin approval
      await approveLtcForm(
        item.file_id,
        item.form_id,
        "accountant", // Next receiver (placeholder - should be configurable)
        "Accountant", // Next receiver designation
        "Forwarded by HR Admin"
      );
      setSuccess("Form approved and forwarded successfully!");
      setTimeout(() => {
        if (onApprovalComplete) {
          onApprovalComplete();
        }
      }, 1500);
    } catch (err) {
      console.error("Approval error:", err);
      setError(`Error approving form: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (item) => {
    setSelectedItemForRejection(item);
    setRejectionRemarks("");
    setRejectionModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionRemarks.trim()) {
      setError("Rejection remarks are required");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      await rejectLtcForm(
        selectedItemForRejection.file_id,
        selectedItemForRejection.form_id,
        rejectionRemarks
      );
      setSuccess("Form rejected successfully!");
      setRejectionModalOpen(false);
      setRejectionRemarks("");
      setSelectedItemForRejection(null);
      setTimeout(() => {
        if (onApprovalComplete) {
          onApprovalComplete();
        }
      }, 1500);
    } catch (err) {
      console.error("Rejection error:", err);
      setError(`Error rejecting form: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-container">
      <Title
        order={2}
        style={{ fontWeight: "500", marginTop: "40px", marginLeft: "15px" }}
      >
        {title}
      </Title>

      {error && (
        <div
          style={{
            padding: "10px 15px",
            marginLeft: "15px",
            marginTop: "10px",
            backgroundColor: "#ffe0e0",
            border: "1px solid #ff6b6b",
            borderRadius: "4px",
            color: "#c92a2a",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "10px 15px",
            marginLeft: "15px",
            marginTop: "10px",
            backgroundColor: "#e0ffe0",
            border: "1px solid #51cf66",
            borderRadius: "4px",
            color: "#2f9e44",
          }}
        >
          {success}
        </div>
      )}

      {data.length === 0 && (
        <EmptyTable
          title="No new Inbox requests found!"
          message="There is no new Inbox request available. Please check back later."
        />
      )}
      {data.length > 0 ? (
        <div className="form-table-container">
          <table className="form-table">
            <thead>
              <tr>
                {["FileID", "User", "Designation", "Date", "View", "Track", "Action"].map(
                  (header, index) => (
                    <th key={index} className="table-header">
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr className="table-row" key={index}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.designation}</td>
                  <td>{item.submissionDate}</td>
                  <td>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleViewClick(item.id)}
                      disabled={isProcessing}
                    >
                      <Eye size={20} />
                      View
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleTrackClick(item.id)}
                      disabled={isProcessing}
                    >
                      <MapPin size={20} />
                      Track
                    </button>
                  </td>
                  <td>
                    <Flex gap="8px">
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => handleApprove(item)}
                        disabled={isProcessing}
                        title="Approve and forward"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: isProcessing ? "#ccc" : "#2f9e44",
                        }}
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => handleRejectClick(item)}
                        disabled={isProcessing}
                        title="Reject with remarks"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: isProcessing ? "#ccc" : "#c92a2a",
                        }}
                      >
                        <X size={18} />
                        Reject
                      </button>
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="loading-spinner" />
      )}

      {/* Rejection Remarks Modal */}
      <Modal
        opened={rejectionModalOpen}
        onClose={() => {
          setRejectionModalOpen(false);
          setRejectionRemarks("");
        }}
        title="Reject Form"
        centered
      >
        <Textarea
          label="Rejection Remarks"
          placeholder="Please provide reason for rejection"
          value={rejectionRemarks}
          onChange={(e) => setRejectionRemarks(e.currentTarget.value)}
          minRows={4}
          maxRows={8}
          required
          disabled={isProcessing}
        />
        <Flex gap="md" mt="md" justify="flex-end">
          <Button
            variant="default"
            onClick={() => {
              setRejectionModalOpen(false);
              setRejectionRemarks("");
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleRejectSubmit}
            loading={isProcessing}
          >
            Reject
          </Button>
        </Flex>
      </Modal>
    </div>
  );
}

export default InboxTable;

InboxTable.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  formType: PropTypes.string.isRequired,
  onApprovalComplete: PropTypes.func,
};
