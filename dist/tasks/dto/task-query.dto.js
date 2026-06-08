"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueryDto = exports.DeadlineStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const task_enum_1 = require("../../common/enums/task.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
var DeadlineStatus;
(function (DeadlineStatus) {
    DeadlineStatus["OVERDUE"] = "overdue";
    DeadlineStatus["UPCOMING"] = "upcoming";
    DeadlineStatus["NO_DEADLINE"] = "no_deadline";
})(DeadlineStatus || (exports.DeadlineStatus = DeadlineStatus = {}));
class TaskQueryDto extends pagination_dto_1.PaginationDto {
}
exports.TaskQueryDto = TaskQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_enum_1.TaskStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_enum_1.TaskStatus),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: task_enum_1.TaskPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(task_enum_1.TaskPriority),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DeadlineStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DeadlineStatus),
    __metadata("design:type", String)
], TaskQueryDto.prototype, "deadlineStatus", void 0);
//# sourceMappingURL=task-query.dto.js.map