export type IDirectory = {
    type: "dir",
    name: string,
    files: (IDirectory | IFile)[],
}

export type IFile = {
    type: "file",
    name: string,
    onclick: () => void,
}