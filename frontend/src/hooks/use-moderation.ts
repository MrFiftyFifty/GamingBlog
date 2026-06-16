import useSWR from "swr";
import * as moderationApi from "@/lib/api/moderation";

export function useComplaints(status: "pending" | "resolved", page?: number) {
  return useSWR(["moderation/complaints", status, page], () =>
    moderationApi.getComplaints({ status, page })
  );
}

export function useModActions(page?: number) {
  return useSWR(["moderation/actions", page], () =>
    moderationApi.getModActions(page)
  );
}
