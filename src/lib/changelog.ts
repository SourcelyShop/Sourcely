export const CHANGELOG_DATA = [
    {
        version: '1.1.0',
        date: '2025-12-28',
        content: `
        Released to public!
        + Added new version notification
        + Added new discover page! https://sourcely.shop/discover
        * Changed premium payment system
        `
    },

    {
        version: '0.1.0',
        date: '2025-12-27',
        content: `
        + Added wishlist page @david
        + Fixed mobile bugs
        + Added discover page! 
        `
    },    
    {
        version: '0.0.0',
        date: '2025-12-25',
        content: `
+ Initial release of Sourcely
+ Added Marketplace for buying and selling assets
+ Added Premium Subscriptions (Monthly/Yearly)
+ Added "Easter Egg" page with confetti 
- Removed legacy authentication system @davidlukes
`
    },
];

export const LATEST_VERSION = CHANGELOG_DATA[0].version;
