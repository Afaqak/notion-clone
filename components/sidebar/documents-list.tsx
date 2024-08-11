import React, { useEffect, useState } from "react";
import Document from "./document";
import { useParams } from "next/navigation";

interface DocumentType {
  is_favorite: unknown;
  _id: string;
  title: string;
  content: string;
  parent_id?: string;
  children?: DocumentType[];
}

const DocumentsList = ({
  documents,
  documentMap,
  nestLevel = 0,
}: {
  documents: DocumentType[];
  nestLevel?: number;
  documentMap: any;
}) => {
  const [openStates, setOpenStates] = useState(
    {} as { [key: string]: boolean }
  );
  const { page } = useParams();


  const findParentDocuments = (docId: string): DocumentType[] => {
    let parents: DocumentType[] = [];
    let currentDoc = documentMap.get(docId);

    while (currentDoc && currentDoc.parent_id) {
      const parentDoc = documentMap.get(currentDoc.parent_id);
      if (parentDoc) {
        parents.push(parentDoc);
      }
      currentDoc = parentDoc;
    }

    return parents;
  };

  useEffect(() => {
    if (page && documents) {
      const parentDocuments = findParentDocuments(page as string);
      const initialOpenStates = { ...openStates } as { [key: string]: boolean };
      parentDocuments.forEach((doc) => {
        initialOpenStates[doc._id] = true;
      });
      setOpenStates(initialOpenStates);
    }
  }, [page, documents]);

  const handleOpenStateChange = (id: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };




  return (
    <div className="flex-1 relative">
      {documents?.map((doc) => (
        <div key={doc._id} style={{ paddingLeft: nestLevel * 10 }}>
          <div>
            <Document
              handleOpenStateChange={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleOpenStateChange(doc._id);
              }}
              open={openStates[doc._id]}
              doc={doc}
              index={nestLevel}
            />
          </div>
          {doc?.children && doc?.children?.length > 0 && openStates[doc._id] ? (
            <DocumentsList documentMap={documentMap} documents={doc.children} nestLevel={nestLevel + 1} />
          ) : (
            openStates[doc._id] && (
              <p className="text-sm text-center text-gray-500">No documents</p>
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default DocumentsList;
