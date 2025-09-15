"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeDashboardAdapter = void 0;
var RealtimeDashboardAdapter = /** @class */ (function () {
    function RealtimeDashboardAdapter() {
        this.listeners = [];
    }
    RealtimeDashboardAdapter.prototype.connect = function (url) {
        var _this = this;
        if (url === void 0) { url = 'ws://localhost:8082/ws'; }
        this.ws = new WebSocket(url);
        this.ws.onopen = function () {
            var _a, _b;
            (_a = _this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: 'AUTH', role: 'ADMIN', branchId: 'b_centro' }));
            (_b = _this.ws) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({ type: 'SUBSCRIBE_KPI' }));
        };
        this.ws.onmessage = function (ev) {
            try {
                var msg_1 = JSON.parse(ev.data);
                if (msg_1.type === 'KPI_UPDATE' || msg_1.type === 'KPI_SNAPSHOT') {
                    _this.listeners.forEach(function (l) { return l(msg_1.data); });
                }
            }
            catch (_a) { }
        };
    };
    RealtimeDashboardAdapter.prototype.onMetrics = function (cb) {
        this.listeners.push(cb);
    };
    return RealtimeDashboardAdapter;
}());
exports.RealtimeDashboardAdapter = RealtimeDashboardAdapter;
