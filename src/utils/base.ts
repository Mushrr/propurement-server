import { PathLike } from "fs";
import { isObject } from "mushr";
import { v4 } from "uuid";
import metaTypeMapping from "../../meta"

/**
 * Check if an object has all the properties in an array
 * @param obj  object to check
 * @param properties array of properties to check
 * @returns true if the object has all the properties
 */
function hasProperties(obj: object, properties: string[]): boolean {
    return obj && properties.every(prop => Object.hasOwnProperty.call(obj, prop));
}

/**
 * 
 * @param obj 对象
 * @param seq 分隔符
 * @returns 以分隔符形式呈现的对象字符串
 */
function objectStringSchema(obj: object, seq = "=") {
    return Object.entries(obj).map((entry) => entry.join(seq)).join(" ");
}

type elType = string | number | object | undefined | null;


/**
 * 将传入的数据修改为符合修改的数据
 * @param obj 传入的待修改的数据
 * @param prefix 前缀
 * @returns 扁平化的数据
 * TODO 如果数组传递进来很可能出现错误!!!!
 */
function objectToMongoUpdateSchema(obj: object, prefix: string | undefined = undefined, skip: string[] = []) {
    const setData: {
        [propName: string]: elType
    } = {};
    const prefixStack: (undefined | string)[] = [];
    prefixStack.push(prefix);
    const objList: object[] = [obj];
    while (prefixStack.length !== 0 && objList.length !== 0) {
        const top = prefixStack.pop();
        const currentParse = objList.pop();
        for (const [key, value] of Object.entries(currentParse!)) {
            const newPrefix: string = top ? `${top}.${key}` : key
            if (skip.indexOf(key)) {
                setData[newPrefix] = value;
            } else if (isObject(value)) {
                prefixStack.push(newPrefix);
                objList.push(value);
            } else {
                setData[newPrefix] = value;
            }
        }
    }
    return setData;
}

/**
 * 从一个对象中提取出一部分键值对
 * @param obj 待提取的对象 
 * @param excludeProperties 不希望包含的属性 
 * @param flip 补集
 * @returns 提取结果
 */
function extractObject(obj: object, excludeProperties: string[] = [], flip = false) {
    const ans: {
        [propName: string]: elType
    } = {};
    for (const [key, value] of Object.entries(obj)) {
        if (excludeProperties.indexOf(key) === -1) {
            ans[key] = value;
        } else if (flip) {
            ans[key] = value;
        }
    }
    return ans;
}

/**
 * 返回文件的meta类型
 * @param path 路径
 * @returns metaType
 */
function getMetaType(path: PathLike) {
    const pathStr = path.toString();
    const extension: keyof typeof metaTypeMapping = (pathStr.split(".").pop() || "default") as keyof typeof metaTypeMapping;
    if (metaTypeMapping[extension]) {
        return metaTypeMapping[extension]
    } else {
        return metaTypeMapping["default"]
    }
}


/**
 * 返回UUID
 */
function createTransitionId() {
    return v4();
}

/**
 * 判断一个字符串是否能够合法转化为日期 
 * @param timeStr 时间字符串
 * @returns 是否是合法字符串
 */
function timeValid(timeStr: string) {
    const time = new Date(timeStr);
    return !isNaN(time.getTime());
}
export {
    hasProperties,
    objectStringSchema,
    objectToMongoUpdateSchema,
    extractObject,
    getMetaType,
    createTransitionId,
    timeValid
}