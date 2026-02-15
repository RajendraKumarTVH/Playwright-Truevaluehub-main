export class SearchTextViewModel {
  category: string;
  matchesCount: number;
  searchText: string;
  textLink: SearchTextLinkModel[] = [];
}

export class SearchTextLinkModel {
  name: string;
  url: string;
  state?: KeyString;
}

interface KeyString {
  [key: string]: {};
}
