import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchDocuments = async () => {
  const response = await axios.get(`/api/documents`);

  return response.data?.data;
};

const fetchDocument = async (id: any) => {
  const response = await axios.get(`/api/documents/${id}`);

  return response.data?.data;
};

export const useDocumentsQuery = () =>
  useQuery({
    queryKey: ["documents"],

    queryFn: () => fetchDocuments(),
  });

export const useDocumentQuery = (id: any) =>
  useQuery({
    queryKey: ["documents", id],

    queryFn: () => fetchDocument(id),
  });

export const fetchFavoriteDocuments = async () => {
  const response = await axios.get(`/api/documents/get-archived`);

  return response.data?.data;
};

export const useFavoriteDocumentQuery = () =>
  useQuery({
    queryKey: ["favorites"],
    queryFn: () => fetchFavoriteDocuments(),
  });

export const useArchivedDocumentQuery = () =>
  useQuery({
    queryKey: ["documents", "archived"],
    queryFn: () => fetchFavoriteDocuments(),
  });
