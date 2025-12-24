import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/app/dashboard/content-planner/content-planner-page.tsx");
const contentToAppend = `

function getClusterColorClass(clusterName: string | null | undefined): string {
    if (!clusterName) return "bg-slate-200";

    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-rose-500",
        "bg-indigo-500",
        "bg-teal-500",
    ];
    
    // Hash function to pick a stable color for a cluster name
    let hash = 0;
    for (let i = 0; i < clusterName.length; i++) {
        hash = clusterName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}
`;

// Read file to ensure we don't append twice
const currentContent = fs.readFileSync(filePath, "utf-8");
if (!currentContent.includes("function getClusterColorClass")) {
    fs.appendFileSync(filePath, contentToAppend);
    console.log("Successfully appended getClusterColorClass function.");
} else {
    console.log("Function already exists.");
}
