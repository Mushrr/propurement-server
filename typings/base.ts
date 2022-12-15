import { Timestamp } from "mongodb";

interface ImageElement {
    id: string,
    type: "image",
    href: string
}

interface VideoElement {
    id: string,
    type: "video",
    href: string
}

interface ParagraphElement {
    id: string,
    type: "paragraph",
    prefix?: string,
    content: string
}

interface HeaderElement {
    id: string,
    type: "header",
    level: 1 | 2 | 3,
    content: string
}

type DocElement = ImageElement | VideoElement | ParagraphElement | HeaderElement;

interface GoodDocument {
    title: string,
    elements: DocElement[],
    lastChange: Timestamp
}

export {
    GoodDocument
}

