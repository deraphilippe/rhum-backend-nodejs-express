class GeneratorId {
    static generate() {
        const date = new Date()
        const month = date.getMonth().toString().padStart(2,0)
        const day = date.getDate().toString().padStart(2,0)
        const hour = date.getHours().toString().padStart(2,0)
        const minute = date.getMinutes().toString().padStart(2,0)
        const second = date.getSeconds().toString().padStart(2,0)

        return `${date.getFullYear()}-${month}-${day}-${hour}-${minute}-${second}`
    }
}

export default GeneratorId