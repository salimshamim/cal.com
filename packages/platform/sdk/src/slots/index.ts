import type { CalSdk } from "../cal";
import { SlotsEndpoints } from "../lib/endpoints";
import { encodeArgsAsQueryString } from "../lib/query-string";
import type { BasicPlatformResponse, ResponseStatus } from "../types";
import type {
  AvailableSlots,
  GetAvaialbleSlotsArgs,
  RemoveSelectedSlotArgs,
  ReserveSlotArgs,
  SlotUID,
} from "./types";

export class Slots {
  constructor(private readonly sdk: CalSdk) {}

  async reserveSlot(args: ReserveSlotArgs): Promise<SlotUID> {
    const { data } = await this.sdk.httpCaller.post<BasicPlatformResponse<SlotUID>>(
      SlotsEndpoints.RESERVE_SLOT,
      args
    );
    return data;
  }

  async removeSelectedSlot(args: RemoveSelectedSlotArgs): Promise<ResponseStatus> {
    const { status } = await this.sdk.httpCaller.delete<BasicPlatformResponse>(
      `${SlotsEndpoints.DELETE_SELECTED_SLOT}?${encodeArgsAsQueryString(args)}`
    );
    return status === "success" ? "success" : "error";
  }

  async getAvailableSlots(args: GetAvaialbleSlotsArgs): Promise<AvailableSlots> {
    const { data } = await this.sdk.httpCaller.get<BasicPlatformResponse<AvailableSlots>>(
      `${SlotsEndpoints.AVAILABLE_SLOTS}?${encodeArgsAsQueryString(args)}`
    );
    return data;
  }
}