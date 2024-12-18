import { Dayjs } from "dayjs";

export interface RecomFields {
  recomItem: {
    dateFrom: Dayjs | string;
    dateTo: Dayjs | string;
    itemFrom: string;
    itemTo: string;
    chkAdv: boolean;
    chkSal: boolean;
    chkSrt: boolean;
    chkRec: boolean;
    chkPrt: boolean;
    chkInv: boolean;
    chkPhc: boolean;
  };
  recomBin: {
    binNumFrom: string;
    binNumTo: string;
  };
  recomBatch: {
    batchNumFrom: string;
    batchNumTo: string;
  };
}
