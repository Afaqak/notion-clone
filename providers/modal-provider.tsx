'use client'
import CreateDocumentModal from "@/components/modals/create-document-modal";
import useModalStore from "@/store/modal-store";

export const ModalProvider = () => {
  const { type } = useModalStore();

  switch (type) {
    case "create":
      return <CreateDocumentModal />;
  }
};
