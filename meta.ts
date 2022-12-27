// 解析文件类型的

const metaTypeMapping = {
    "default": "text/plain",
    "html": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "gif": "image/gif",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "json": "application/json",
    "pdf": "application/pdf",
    "zip": "application/zip",
    "rar": "application/x-rar-compressed",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    "wav": "audio/wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "avi": "video/avi",
    "rm": "audio/x-pn-realaudio",
    "rmvb": "audio/x-pn-realaudio",
    "flv": "video/x-flv",
    "swf": "application/x-shockwave-flash",
    "torrent": "application/x-bittorrent"
}

export default metaTypeMapping