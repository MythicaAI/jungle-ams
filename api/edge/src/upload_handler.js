var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
addEventListener('fetch', function (event) {
    event.respondWith(handleRequest(event.request));
});
function handleRequest(request) {
    return __awaiter(this, void 0, void 0, function () {
        var contentType, formData, file, key, r2Response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(request.method === 'POST')) return [3 /*break*/, 4];
                    contentType = request.headers.get('Content-Type') || '';
                    if (!contentType.startsWith('multipart/form-data')) return [3 /*break*/, 3];
                    return [4 /*yield*/, request.formData()];
                case 1:
                    formData = _a.sent();
                    file = formData.get('file');
                    if (!file) return [3 /*break*/, 3];
                    key = "uploads/".concat(file.name);
                    return [4 /*yield*/, uploadToR2(key, file)];
                case 2:
                    r2Response = _a.sent();
                    if (r2Response.ok) {
                        return [2 /*return*/, new Response('File uploaded successfully', { status: 200 })];
                    }
                    else {
                        return [2 /*return*/, new Response('Failed to upload file', { status: 500 })];
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, new Response('Bad Request', { status: 400 })];
                case 4: return [2 /*return*/, new Response('Method Not Allowed', { status: 405 })];
            }
        });
    });
}
function uploadToR2(key, file) {
    return __awaiter(this, void 0, void 0, function () {
        var R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_REGION, r2Endpoint, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    R2_BUCKET_NAME = 'your-r2-bucket-name';
                    R2_ACCESS_KEY_ID = 'your-access-key-id';
                    R2_SECRET_ACCESS_KEY = 'your-secret-access-key';
                    R2_REGION = 'auto';
                    r2Endpoint = "https://".concat(R2_BUCKET_NAME, ".r2.cloudflarestorage.com/").concat(key);
                    return [4 /*yield*/, fetch(r2Endpoint, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': file.type,
                                'Content-Length': file.size,
                                'Authorization': "AWS4-HMAC-SHA256 Credential=".concat(R2_ACCESS_KEY_ID, "/").concat(R2_REGION, "/r2/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=").concat(R2_SECRET_ACCESS_KEY),
                                'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
                                'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
                            },
                            body: file.stream()
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
