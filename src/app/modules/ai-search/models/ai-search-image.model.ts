export class AISearchImage {
  imageUrl: string;
  manufacturingCategory: string;
  partId: string;
  projectInfoId: string;
  isSearched: boolean;
  partNumber: string;
  partDescription: string;
}

export class AICompareRequest {
  clientId: number;
  debug: boolean;
  query: Query[];
}

export class Query {
  partsId: string;
  actual_cost_of_parts: number;
  image_similarity_score: number;
}

export class AICompareResult {
  results: Result[];
}

export class Result {
  actual_cost: number;
  attributes: Attribute[];
  comparative_index: number;
  image_similarity_score: number;
  partsId: string;
  should_cost: number;
}

export class Attribute {
  _id: number;
  attribute_cost_contribution?: number;
  attribute_name: string;
  attribute_value: string;
  category: string;
  standard_deviation_value: string;
}
