import { useState } from "react";

export const useRoomModals = () => {
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const openProblemModal = (problem = null) => {
    setEditingProblem(problem);
    setProblemModalOpen(true);
  };

  const closeProblemModal = () => {
    setEditingProblem(null);
    setProblemModalOpen(false);
  };

  return {
    problemModalOpen,
    editingProblem,
    inviteModalOpen,
    setInviteModalOpen,
    openProblemModal,
    closeProblemModal,
  };
};
