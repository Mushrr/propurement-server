import { validateUser } from '@utils/fetchTools';
import { hasProperties } from '@utils/base';
// FileUploader


import { getMetaType } from "@utils/base";
import logger from "@utils/logger";
import { createReadStream, createWriteStream, existsSync, read, rmSync, statSync } from "fs";
import Route from "koa-router";
import path from "path";
import type { File } from "formidable"
import { v4 as uuidv4 } from "uuid";

const fileRoute = new Route();

/**
 * 
 * @param {string} fileType 指定文件的类型
 * @param {string} fileName 指定文件名
 * @returns 返回文件
 */
fileRoute.get('/:fileType/:fileName', async (ctx, next) => {

    logger.info(ctx.url);
    const filePath = path.join(__dirname, `../../../public/${ctx.params.fileType}/${ctx.params.fileName}`);

    const isExist = existsSync(filePath)
    const stats = statSync(filePath);
    try {
        if (isExist && stats.isFile()) {
            ctx.body = createReadStream(filePath);
            ctx.res.setHeader('Content-Type', getMetaType(filePath));
            //NOTE - 如果是文本的话可能会遇见字符编码的问题!!!!
        } else {
            ctx.body = "File Not Exist!";
        }
    } catch (err) {
        ctx.body = "File Not Exist!";
    }

    await next();
})


/**
 * 
 * @param {string} openid 管理员openid
 * @param {File} files 文件
 * 上传文件 
 */
fileRoute.post("/", async (ctx, next) => {

    const prefix = "/admin/file"

    const req = ctx.request.body || {};

    if (hasProperties(req, ["openid"])) {
        const userValidate = await validateUser(req.openid, ctx);
        if (userValidate === "admin") {
            // 解析文件保存起来
            const files = ctx.request.files;
            if (files) {
                const allFiles: [string, File | File[]][] = Object.entries(files);
                for (const [fileName, file] of allFiles) {
                    if (Array.isArray(file)) {
                        const urls = [];
                        let err = false;
                        let errorCounter = 0;                        
                        for (const f of file) {
                            const [fileType, extension] = f.mimetype!.split('/');
                            const suffix = `${fileType}/${uuidv4()}.${extension}`;
                            const filePath = path.join(__dirname, `../../../public/${suffix}`);
                            const writer = await createWriteStream(filePath);

                            const reader = await createReadStream(f.filepath);
                            await reader.pipe(writer);

                            if (writer.errored || reader.errored) {
                                err = true;
                                errorCounter ++;
                            }             
                                           
                            urls.push({
                                state: err,
                                url: err ? "" : `${prefix}/${suffix}`
                            });
                            err = false;
                        }
                        
                        if (errorCounter !== file.length) {
                            ctx.body = {
                                code: 200,
                                message: `上传成功${file.length - errorCounter}个文件，失败${errorCounter}个文件`,
                                data: urls
                            }
                            logger.info(`上传 ${file.length} 个文件成功`);
                        } else {
                            ctx.body = {
                                code: 500,
                                message: "文件上传失败!"
                            },
                            ctx.status = 500;
                            logger.warn(`上传 ${file.length} 个文件全部失败`)
                        }

                    } else {
                        let err = false;
                        const [fileType, extension] = file.mimetype!.split('/');
                        const suffix = `${fileType}/${uuidv4()}.${extension}`
                        const filePath = path.join(__dirname, `../../../public/${suffix}`);
                        const writer = await createWriteStream(filePath);
                        const reader = await createReadStream(file.filepath);
                        reader.pipe(writer);

                        if (writer.errored || reader.errored) {
                            err = true;
                        }

                        if (err) {
                            ctx.body = {
                                code: 500,
                                message: "上传失败",
                            }
                            ctx.status = 500
                            logger.warn('文件上传失败');
                        } else {
                            ctx.body = {
                                code: 200,
                                message:"上传成功",
                                data: `${prefix}/${suffix}`
                            }
                            logger.warn('上传成功');
                        }
                    }
                }
            } else {
                ctx.body = {
                    code: 400,
                    message: "您没有上传文件的权限"
                }
            }
        } else {
            ctx.body = {
                code: 500,
                message: "身份认证未通过"
            }
        }

        await next();
    }
});


/**
 * 返回文件
 * @param {string} openid 管理员openid
 * @param {string} fileType 指定文件的类型
 * @param {string} fileName 指定文件名
 */
fileRoute.del("/:fileType/:fileName", async (ctx, next) => {

    const req = ctx.request.query || {};
    const { fileType, fileName } = ctx.params;
    if (hasProperties(req, ["openid"])) {

        const userValidate = await validateUser(req.openid as string, ctx);

        if (userValidate === "admin") {
                
    
                const filePath = path.join(__dirname, `../../../public/${fileType}/${fileName}`);
    
                const isExist = existsSync(filePath);
                if (isExist) {
                    try {
                        const stats = statSync(filePath);
                        if (isExist && stats.isFile()) {
                            const ans = rmSync(filePath);
                            ctx.body = {
                                code: 200,
                                message: "删除成功",
                                data: ans
                            }
                        } else {
                            ctx.body = {
                                code: 500,
                                message: "文件不存在"
                            }
                            ctx.status = 500
                        }
                    } catch (err) {
                        ctx.body = {
                            code: 500,
                            message: "文件不存在"
                        }
                        ctx.status = 500
                    }    
                } else {
                    ctx.body = {
                        code: 500,
                        message: "文件不存在"
                    }
                    ctx.status = 500
                }
                
        } else {
            ctx.body = {
                code: 400,
                message: "您没有删除文件的权限"
            }
            ctx.status = 400;
        }
    } else {
        ctx.body = {
            code: 500,
            message: "身份认证未通过"
        }
        ctx.status = 500;
    }

    await next();
})

export default fileRoute;