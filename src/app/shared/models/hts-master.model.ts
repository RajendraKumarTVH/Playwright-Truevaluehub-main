export interface HtsSectionDto {
  htsSectionId: number;
  htsSectionCode: string;
  htsSectionName: string;
  isActive: boolean;
  Rank: number;
  GroupName: string;
}

export interface HtsChapterDto {
  htsChapterId: number;
  htsSectionId: number;
  htsChapterCode: string;
  htsChapterName: string;
  isActive: boolean;
}

export interface HtsHeadingDto {
  htsHeadingId: number;
  htsChapterId: number;
  htsHeadingCode: string;
  htsHeadingName: string;
  isActive: boolean;
}

export interface HtsSubHeadingDto {
  htsSubHeadingId: number;
  htsHeadingId: number;
  htsSubHeadingCode: string;
  htsSubHeadingName: string;
  isActive: boolean;
}

export interface HtsMasterDto {
  sections: HtsSectionDto[];
  chapters: HtsChapterDto[];
  headings: HtsHeadingDto[];
  subHeadings: HtsSubHeadingDto[];
}

export interface HtsSubHeading1Dto {
  htsSubHeading1Id: number;
  htsSubHeading1Name: string;
  htsSubHeading1Code: string;
  htsSubHeadingId: number;
}

export interface HtsSubHeading2Dto {
  htsSubHeading2Id: number;
  htsSubHeading2Name: string;
  htsSubHeading2Code: string;
  htsSubHeading1Id: number;
}

export interface HtsMasterDataDto {
  htsMasterId: number;
  htsSectionId: number;
  htsChapterId: number;
  htsHeadingId: number;
  htsSubHeadingId: number;
  htsSectionName: string;
  htsChapterName: string;
  htsHeadingName: string;
  htsSubHeadingName: string;
  htsSubHeading1Name: string;
  htsSubHeading2Name: string;
  htsCode: string;
  isActive: boolean;
  htsSection: HtsSectionDto;
  htsChapter: HtsChapterDto;
  htsHeading: HtsHeadingDto;
  htsSubHeading: HtsSubHeadingDto;
  Rank: number;
}
