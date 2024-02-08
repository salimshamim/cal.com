import { UpdateScheduleInput } from "@/ee/schedules/inputs/update-schedule.input";
import { SchedulesService } from "@/ee/schedules/services/schedules.service";
import { ScheduleResponse, schemaScheduleResponse } from "@/ee/schedules/zod/response/response";
import { GetUser } from "@/modules/auth/decorators/get-user/get-user.decorator";
import { AccessTokenGuard } from "@/modules/auth/guards/access-token/access-token.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  UseGuards,
} from "@nestjs/common";

import { SUCCESS_STATUS } from "@calcom/platform-constants";
import { ApiResponse } from "@calcom/platform-types";

import { CreateScheduleInput } from "../inputs/create-schedule.input";

@Controller({
  path: "schedules",
  version: "2",
})
@UseGuards(AccessTokenGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post("/")
  async createSchedule(
    @GetUser("id") userId: number,
    @Body() bodySchedule: CreateScheduleInput
  ): Promise<ApiResponse<{ schedule: ScheduleResponse }>> {
    const schedule = await this.schedulesService.createUserSchedule(userId, bodySchedule);
    const scheduleResponse = schemaScheduleResponse.parse(schedule);

    return {
      status: SUCCESS_STATUS,
      data: {
        schedule: scheduleResponse,
      },
    };
  }

  @Get("/default")
  async getDefaultSchedule(
    @GetUser("id") userId: number
  ): Promise<ApiResponse<{ schedule: ScheduleResponse }>> {
    const schedule = await this.schedulesService.getUserScheduleDefault(userId);
    const scheduleResponse = schemaScheduleResponse.parse(schedule);

    return {
      status: SUCCESS_STATUS,
      data: {
        schedule: scheduleResponse,
      },
    };
  }

  @Get("/:scheduleId")
  async getSchedule(
    @GetUser("id") userId: number,
    @Param("scheduleId") scheduleId: number
  ): Promise<ApiResponse<{ schedule: ScheduleResponse }>> {
    const schedule = await this.schedulesService.getUserSchedule(userId, scheduleId);
    const scheduleResponse = schemaScheduleResponse.parse(schedule);

    return {
      status: SUCCESS_STATUS,
      data: {
        schedule: scheduleResponse,
      },
    };
  }

  @Get("/")
  async getSchedules(@GetUser("id") userId: number): Promise<ApiResponse<{ schedules: ScheduleResponse[] }>> {
    const schedules = await this.schedulesService.getUserSchedules(userId);
    const schedulesResponse = schedules.map((schedule) => schemaScheduleResponse.parse(schedule));

    return {
      status: SUCCESS_STATUS,
      data: {
        schedules: schedulesResponse,
      },
    };
  }

  @Patch("/:scheduleId")
  async updateSchedule(
    @GetUser("id") userId: number,
    @Param("scheduleId") scheduleId: number,
    @Body() bodySchedule: UpdateScheduleInput
  ): Promise<ApiResponse<{ schedule: ScheduleResponse }>> {
    const schedule = await this.schedulesService.updateUserSchedule(userId, scheduleId, bodySchedule);
    const scheduleResponse = schemaScheduleResponse.parse(schedule);

    return {
      status: SUCCESS_STATUS,
      data: {
        schedule: scheduleResponse,
      },
    };
  }

  @Delete("/:scheduleId")
  @HttpCode(HttpStatus.OK)
  async deleteSchedule(
    @GetUser("id") userId: number,
    @Param("scheduleId") scheduleId: number
  ): Promise<ApiResponse> {
    await this.schedulesService.deleteUserSchedule(userId, scheduleId);

    return {
      status: SUCCESS_STATUS,
    };
  }
}