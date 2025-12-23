const plan = {
    posts_per_month: undefined, // Missing in DB
    backlinks_per_post: undefined,
    qa_validation: undefined,
    integrations_limit: undefined,
};

const usage = {
    posts_generated: 0,
    backlinks_generated: 0,
};

const postsUsedPercent = (usage.posts_generated / plan.posts_per_month) * 100;
console.log("postsUsedPercent:", postsUsedPercent);

if (usage.posts_generated >= plan.posts_per_month) {
    console.log("Limit reached (incorrectly?)");
} else {
    console.log("Allowed (correctly?)");
}

const status = "active";
if (!plan || !usage) {
    console.log("No plan or usage");
} else if (status !== "active") {
    console.log("Not active");
} else if (usage.posts_generated >= plan.posts_per_month) {
    console.log("Limit reached");
} else {
    console.log("ALLOWED");
}
