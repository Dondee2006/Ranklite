import { supabaseAdmin } from "@/lib/supabase/admin";
import { createCMSClient, CMSType } from "@/lib/cms";
import { ContentEngine } from "@/lib/backlink-core/content-engine";

export async function placeBacklink(
  sourceSiteId: string,
  targetUrl: string,
  targetAnchorText: string
): Promise<{ success: boolean; linkingUrl?: string; error?: string }> {
  try {
    // 1. Fetch CMS integration for the source site
    const { data: interaction, error: interactionError } = await supabaseAdmin
      .from("cms_integrations")
      .select("*")
      .eq("site_id", sourceSiteId)
      .in("platform", ["wordpress", "shopify", "wix", "notion"])
      .eq("status", "connected")
      .limit(1)
      .maybeSingle();

    if (interactionError || !interaction) {
      return {
        success: false,
        error: interactionError?.message || "No active CMS integration found for source site"
      };
    }

    // 2. Initialize CMS client
    const cmsClient = createCMSClient({
      id: interaction.id,
      cms_type: interaction.platform as CMSType,
      access_token: interaction.credentials.access_token || interaction.credentials.accessToken,
      site_url: interaction.site_url || interaction.credentials.siteUrl,
      settings: interaction.config || {},
    });

    // 3. Find a suitable post/article to edit
    let postToEdit: any = null;
    let linkingUrl = "";

    if (interaction.platform === "wordpress") {
      const posts = await (cmsClient as any).getPosts({ per_page: 5 });
      if (posts && posts.length > 0) {
        postToEdit = posts[0];
        linkingUrl = postToEdit.link || `${interaction.site_url}/${postToEdit.slug}`;
      }
    } else if (interaction.platform === "shopify") {
      const blogs = await (cmsClient as any).getBlogs();
      if (blogs && blogs.length > 0) {
        const articles = await (cmsClient as any).getArticles(blogs[0].id, { limit: 5 });
        if (articles && articles.length > 0) {
          postToEdit = articles[0];
          linkingUrl = `${interaction.site_url}/blogs/${blogs[0].handle}/${postToEdit.handle}`;
        }
      }
    } else if (interaction.platform === "wix") {
      const posts = await (cmsClient as any).fetchBlogPosts(interaction.credentials.access_token);
      if (posts && posts.length > 0) {
        postToEdit = posts[0];
        linkingUrl = `${interaction.site_url}/post/${postToEdit.slug}`;
      }
    } else if (interaction.platform === "notion") {
      const posts = await (cmsClient as any).getBlogPosts();
      if (posts && posts.length > 0) {
        postToEdit = posts[0];
        linkingUrl = postToEdit.url || `${interaction.site_url}/${postToEdit.slug}`;
      }
    }

    if (!postToEdit) {
      return { success: false, error: "No eligible posts found on host site" };
    }

    // 4. Generate AI paragraph with the link
    const existingContent = postToEdit.content?.rendered || postToEdit.body_html || "";
    const topicContext = postToEdit.title?.rendered || postToEdit.title || "general";

    const placement = await ContentEngine.createContextualPlacement(
      existingContent,
      targetUrl,
      targetAnchorText,
      topicContext
    );

    // 5. Update the post with the new link paragraph
    const updatedContent = `${existingContent}\n\n${placement.content}`;

    if (interaction.platform === "wordpress") {
      await (cmsClient as any).updatePost(postToEdit.id, {
        content: updatedContent,
      });
    } else if (interaction.platform === "shopify") {
      const blogs = await (cmsClient as any).getBlogs();
      await (cmsClient as any).updateArticle(blogs[0].id, postToEdit.id, {
        body_html: updatedContent,
      });
    } else if (interaction.platform === "wix") {
      await (cmsClient as any).updateBlogPost(interaction.credentials.access_token, postToEdit.id, {
        content: updatedContent,
      });
    } else if (interaction.platform === "notion") {
      const blocks = (cmsClient as any).textToBlocks(placement.content);
      await (cmsClient as any).appendBlocks(postToEdit.id, blocks);
    }

    return {
      success: true,
      linkingUrl: linkingUrl,
    };
  } catch (error) {
    console.error("Backlink placement failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal placement error",
    };
  }
}
