import * as Parser from 'rss-parser';


type CustomItem = {
    title: string,
    link: string,
    bar: number,
    image: string;
    description?: string;
};

type CustomFeed = {
    foo: string,
    baz: string,
    items: CustomItem[],
};

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

const parser = new Parser<CustomFeed, CustomItem>({
    customFields: {
        feed: ['foo', 'baz'],
        item: ['bar', 'image']
    }
});

export default async function getFeed(): Promise<CustomFeed | null> {
    try {
        const response = await fetch(`${CORS_PROXY}https://www.inoreader.com/stream/user/1005113559/tag/Actu%20Software`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "application/xml");
        const items = Array.from(doc.querySelectorAll("item"));

        const feed: CustomFeed = {
            foo: "",
            baz: "",
            items: [],
        };

        for (const item of items) {
            const title = item.querySelector("title")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            const description = item.querySelector("description")?.textContent || "";
            const imageMatch = description.match(
                /<img.*?src=['"](.*?)['"]/i
            );
            const image = imageMatch ? imageMatch[1] : "";

            feed.items.push({
                title,
                link,
                bar: 0,
                image,
                description,
            });
        }
        return feed;
    } catch (error) {
        console.error("Erreur lors de la récupération du flux RSS", error);
        return null;
    }
}

