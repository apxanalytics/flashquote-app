import { DANGER, INFO, OK } from "./colors";

export const statusColor = (it: any) => {
  if (!it?.description_clean || Number(it?.total) <= 0) {
    return {
      border: `1px solid ${DANGER}`,
      background: `${DANGER}22`,
    };
  }
  if (!it?.finalized) {
    return {
      border: `1px solid ${INFO}`,
      background: `${INFO}22`,
    };
  }
  return {
    border: `1px solid ${OK}`,
    background: `${OK}22`,
  };
};
