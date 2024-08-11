import { useDocumentQuery } from "@/features/documents/queries";
import { useSearchParams } from "next/navigation";
import React from "react";
import Editor from "../editor";
import Modal from ".";
import useModalStore from "@/store/modal-store";

const CreateDocumentModal = () => {
  const page = useSearchParams().get("p") as string;
  const { data } = useDocumentQuery(page);
  const { type } = useModalStore();
  let isOpen = type === "create";
  return (
    <Modal
      className="h-[500px] shadow-max overflow-y-auto text-black z-[10000000] max-w-[700px] w-full"
      isOpen={isOpen}
    >
      <Editor page={page} data={data} />
    </Modal>
  );
};

export default CreateDocumentModal;
