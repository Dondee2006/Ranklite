
const { placeBacklink } = require('../src/lib/backlink-engine/placement-service');
const { supabaseAdmin } = require('../src/lib/supabase/admin');
const { ContentEngine } = require('../src/lib/backlink-core/content-engine');
const { createCMSClient } = require('../src/lib/cms');

// Mock dependencies
jest.mock('../src/lib/supabase/admin');
jest.mock('../src/lib/backlink-core/content-engine');
jest.mock('../src/lib/cms');

describe('Authority Exchange: Placement Orchestrator', () => {
    const mockSiteId = 'source-site-123';
    const mockTargetUrl = 'https://target.com';
    const mockAnchorText = 'best saas tool';

    it('should successfully place a backlink on a WordPress site', async () => {
        // 1. Mock DB response
        supabaseAdmin.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    in: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                maybeSingle: jest.fn().mockResolvedValue({
                                    data: {
                                        id: 'int-123',
                                        platform: 'wordpress',
                                        credentials: { access_token: 'wp-token' },
                                        site_url: 'https://mysite.com'
                                    },
                                    error: null
                                })
                            })
                        })
                    })
                })
            })
        });

        // 2. Mock CMS client
        const mockWpClient = {
            getPosts: jest.fn().mockResolvedValue([{ id: 1, slug: 'hello-world', content: { rendered: 'Old content' }, title: { rendered: 'Hello World' } }]),
            updatePost: jest.fn().mockResolvedValue({ success: true })
        };
        createCMSClient.mockReturnValue(mockWpClient);

        // 3. Mock AI paragraph generation
        ContentEngine.createContextualPlacement.mockResolvedValue({
            content: 'Here is a new paragraph with the link.',
            placementPosition: 'contextual'
        });

        const result = await placeBacklink(mockSiteId, mockTargetUrl, mockAnchorText);

        expect(result.success).toBe(true);
        expect(result.linkingUrl).toBe('https://mysite.com/hello-world');
        expect(mockWpClient.updatePost).toHaveBeenCalledWith(1, {
            content: expect.stringContaining('Here is a new paragraph with the link.')
        });
    });

    it('should fail gracefully if no CMS is connected', async () => {
        supabaseAdmin.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    in: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
                            })
                        })
                    })
                })
            })
        });

        const result = await placeBacklink(mockSiteId, mockTargetUrl, mockAnchorText);
        expect(result.success).toBe(false);
        expect(result.error).toContain('No active CMS integration');
    });
});
