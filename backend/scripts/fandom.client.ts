const API_URL = 'https://disney-villainous.fandom.com/api.php';

/* Interface for a Fandom page, an interface is a TypeScript construct that defines the shape of an object. 
In this case, it defines the properties of a Fandom page, including its title, page ID, wikitext, HTML content, and images. */
export interface FandomPage {
  title: string;
  pageId: number;
  wikitext: string;
  html: string;
  images: string[];
}

// Interface for the response from the Fandom API when parsing a page. It includes the parsed content of the page, as well as any error information if the request was unsuccessful.
interface FandomParseResponse {
  parse?: {
    title: string;
    pageid: number;
    wikitext: string;
    text: string;
    images: string[];
  };
  error?: {
    info: string;
  };
}

// Fetches a Fandom page by title and returns its content, wikitext, and images.
export async function getFandomPage(title: string): Promise<FandomPage> {
  // Construct the query parameters for the API request
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text|wikitext|images',
    format: 'json',
    formatversion: '2',
  });

  const response = await fetch(`${API_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Fandom returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as FandomParseResponse;

  if (data.error) {
    throw new Error(data.error.info);
  }

  if (!data.parse) {
    throw new Error(`Page "${title}" was not found`);
  }

  return {
    title: data.parse.title,
    pageId: data.parse.pageid,
    wikitext: data.parse.wikitext,
    html: data.parse.text,
    images: data.parse.images,
  };
}
