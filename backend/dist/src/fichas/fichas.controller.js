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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FichasController = void 0;
const common_1 = require("@nestjs/common");
const fichas_service_1 = require("./fichas.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FichasController = class FichasController {
    fichasService;
    constructor(fichasService) {
        this.fichasService = fichasService;
    }
    getOrCreate(citaId) {
        return this.fichasService.getOrCreateFicha(citaId);
    }
    guardar(citaId, body) {
        return this.fichasService.guardar(citaId, body);
    }
    getPorPaciente(pacienteId) {
        return this.fichasService.getPorPaciente(pacienteId);
    }
};
exports.FichasController = FichasController;
__decorate([
    (0, common_1.Get)('cita/:citaId'),
    __param(0, (0, common_1.Param)('citaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FichasController.prototype, "getOrCreate", null);
__decorate([
    (0, common_1.Post)('cita/:citaId'),
    __param(0, (0, common_1.Param)('citaId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FichasController.prototype, "guardar", null);
__decorate([
    (0, common_1.Get)('paciente/:pacienteId'),
    __param(0, (0, common_1.Param)('pacienteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FichasController.prototype, "getPorPaciente", null);
exports.FichasController = FichasController = __decorate([
    (0, common_1.Controller)('fichas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [fichas_service_1.FichasService])
], FichasController);
//# sourceMappingURL=fichas.controller.js.map