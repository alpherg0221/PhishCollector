import {Warning, UrlInfo} from "../home/HomeState.tsx";

const API_KEY = "AIzaSyCBqZ318-seWcLobTmNZetcOZhn533ocEk";

type RequestBody = {
  client: {
    clientId: string,
    clientVersion: string,
  },
  threatInfo: {
    threatTypes: ("THREAT_TYPE_UNSPECIFIED" | "MALWARE" | "SOCIAL_ENGINEERING" | "UNWANTED_SOFTWARE" | "POTENTIALLY_HARMFUL_APPLICATION")[],
    platformTypes: ("PLATFORM_TYPE_UNSPECIFIED" | "WINDOWS" | "LINUX" | "ANDROID" | "OSX" | "IOS" | "ANY_PLATFORM")[],
    threatEntryTypes: ("URL")[],
    threatEntries: { url: string }[]
  },
}

type ResponseBody = {
  matches?: {
    threatType: ("THREAT_TYPE_UNSPECIFIED" | "MALWARE" | "SOCIAL_ENGINEERING" | "UNWANTED_SOFTWARE" | "POTENTIALLY_HARMFUL_APPLICATION")[],
    platformTypes: ("PLATFORM_TYPE_UNSPECIFIED" | "WINDOWS" | "LINUX" | "ANDROID" | "OSX" | "IOS" | "ANY_PLATFORM")[],
    threatEntryTypes: ("URL")[],
    threat: { url: string },
    threatEntryMetadata: {
      entries: { key: string, value: string }[],
    },
    cacheDuration: string,
  }[],
}

export const checkGSB = async (urlInfo: UrlInfo[]) => {
  const requestBody: RequestBody = {
    client: {
      clientId: "phishCollector",
      clientVersion: "1.0.0",
    },
    threatInfo: {
      threatTypes: ["THREAT_TYPE_UNSPECIFIED", "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: urlInfo.map(urlInfo => ({ url: urlInfo.url }))
    }
  };

  const gsbResponse: ResponseBody = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${ API_KEY }`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  }).then(data => data.json());

  console.log(gsbResponse);

  return urlInfo.map(urlInfo => ({
    ...urlInfo,
    warningGSB: gsbResponse.matches?.map(match => match.threat.url).includes(urlInfo.url) ? Warning.Phishing : Warning.Safe,
  }) as UrlInfo);
}