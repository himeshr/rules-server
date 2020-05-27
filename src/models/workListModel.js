import {
  ModelGeneral as General,
  WorkList,
  WorkLists,
  WorkItem
} from "openchs-models";

//subject Dashboard profile Tab
export const mapWorkList = workListRequest => {
  if (workListRequest) {
    return new WorkLists(mapWorkListIterate(workListRequest)[0]);
  }
};

export const mapWorkListIterate = (workLists) => {
      return workLists.map(workList => {
          // return workList(workList);
          return new WorkList(workList.name,mapWorkItems(workList.workItems));
      });
};

export const workList = (workList) => {
  return new WorkList(workList.name,mapWorkItems(workList.workItems));
};

export const mapWorkItems = (workItems) => {
  return workItems.map(workItem => {
      // return workItem(workItem);
      return new WorkItem(workItem.id,workItem.type,workItem.parameters);
  });
};

export const workItem = (workItem) => {
  return new WorkItem(workItem.id,workItem.type,workItem.parameters);
};


