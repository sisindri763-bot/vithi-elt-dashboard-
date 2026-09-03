/**
 * Exports an array of objects to a CSV file download.
 * @param rows   - Array of flat objects (each key becomes a column)
 * @param filename - File name without extension
 */
export function exportToCsv(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return

  const headers = Object.keys(rows[0])
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? ""
          const str = String(val).replace(/"/g, '""')
          return str.includes(",") || str.includes("\n") || str.includes('"')
            ? `"${str}"`
            : str
        })
        .join(",")
    ),
  ]

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href     = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
