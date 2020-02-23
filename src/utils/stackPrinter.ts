const split = thing => {
    if (typeof thing === "string") {
        return thing.split("/")
    } else if (thing.fast_slash) {
        return ""
    } else {
        const match = thing
            .toString()
            .replace("\\/?", "")
            .replace("(?=\\/|$)", "$")
            .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
        return match ? match[1].replace(/\\(.)/g, "$1").split("/") : "<complex:" + thing.toString() + ">"
    }
}

const printPath = (path, layer) => {
    if (layer.route) {
        layer.route.stack.forEach(printPath.bind(null, path.concat(split(layer.route.path))))
    } else if (layer.name === "router" && layer.handle.stack) {
        layer.handle.stack.forEach(printPath.bind(null, path.concat(split(layer.regexp))))
    } else if (layer.method) {
        console.log(
            "%s /%s",
            layer.method.toUpperCase(),
            path
                .concat(split(layer.regexp))
                .filter(Boolean)
                .join("/"),
        )
    }
}

export const print = stack => {
    stack.forEach(printPath.bind(null, []))
}
