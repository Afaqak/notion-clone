import { DocumentType } from "@/types/type";

export const updateDocumentTree = (
  tree: DocumentType,
  id: string,
  newTitle?: string,
  newIcon?: string
): DocumentType => {
  
  if (!tree) return tree;

  if (tree._id === id) {
    return {
      ...tree,
      ...(newTitle && { title: newTitle }),
      ...(newIcon && { icon: newIcon }),
    };
  }

  if (tree.children) {
    return {
      ...tree,
      children: tree.children.map((child) =>
        updateDocumentTree(child, id, newTitle, newIcon)
      ),
    };
  }

  return tree;

};
