import * as React from "react"
import * as ReactDOM from 'react-dom'
import craftXIconSrc from "./craftx-icon.png"
import getFeed from "./rss";


const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

type FeedType = {
  title: string;
  link: string;
  items: {
    title: string;
    link: string;
    image: string;
    description: string;
  }[];
};

type CustomItem = {
  title: string;
  link: string;
  bar: number;
  image: string;
  description?: string;
  imgUrl?: string;
};

type CustomFeed = {
  foo: string,
  baz: string,
  items: CustomItem[],
};

const App: React.FC<{}> = () => {

  const isDarkMode = useCraftDarkMode();
  const [feed, setFeed] = React.useState<CustomFeed | null>(null);

  React.useEffect(() => {
    getFeed().then(feedResponse => {

      const feedCopy = JSON.parse(JSON.stringify(feedResponse));

      const fetches = feedCopy.items.map(fetchImage);

      Promise.all(fetches).then((newItems) => {
        feedCopy.items = newItems;
        setFeed(feedCopy);
      });
    });

    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);


  async function fetchImage(item: CustomItem) {
    const response = await fetch(`${CORS_PROXY}${item.image}`, {
      headers: {'x-requested-with': 'yourDomain.com'}
    });
    const images = await response.blob();
    item.imgUrl = URL.createObjectURL(images);

    return item;
  }

  return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        marginBottom: "20px",
        width: "100%",
      }}>
        <img style={{
          width: "auto",
          height: "44px",
          marginBottom: "30px",
        }} className="icon" src="https://logos-download.com/wp-content/uploads/2020/07/Product_Hunt_Logo.png"
             alt="CraftX logo"/>
        {feed && feed.items.map((item, index) => (
            <a href={item.link} key={index} target="_blank" rel="noopener noreferrer" style={{
              textDecoration: "none",
              color: "#333",
              textAlign: "center",
              marginBottom: "10px",
              background: "linear-gradient(to right, #FBFBFB 0%, #E3E3E3 100%)", // Gradient background
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              width: "80%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}  onClick={(event) => {
              event.preventDefault();
              insertHelloWorld(feed.items, item);

            }}>
              <h2 style={{
                fontSize: "18px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#333"
              }}>{item.title}</h2>
              {item.imgUrl &&
                  <img
                      style={{
                        width: "auto",
                        height: "120px",
                        marginBottom: "8px",
                        borderRadius: "8px"
                      }}
                      alt="test"
                      src={item.imgUrl}
                  />
              }
            </a>
        ))}
      </div>
  );
}

function useCraftDarkMode() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    craft.env.setListener(env => setIsDarkMode(env.colorScheme === "dark"));
  }, []);

  return isDarkMode;
}

function insertHelloWorld(feedItems: CustomItem[], clickedItem: CustomItem | null) {
  if (clickedItem && clickedItem.description) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(clickedItem.description, "text/html");
    const paragraphs = htmlDoc.getElementsByTagName("p");
    let content = "";
    for (let i = 0; i < paragraphs.length; i++) {
      content += paragraphs[i].textContent + " ";
    }

    const trimmedContent = content.trim().substring(0, 40); // Limiter à 40 caractères

    const block = craft.blockFactory.urlBlock({
      url: clickedItem.link,
      title: clickedItem.title,
      pageDescription: trimmedContent,
      imageUrl: clickedItem.image,
    });

    craft.dataApi.addBlocks([block]);
    return trimmedContent;
  }
  return null;
}





export function initApp() {
  ReactDOM.render(<App/>, document.getElementById('react-root'))
}
