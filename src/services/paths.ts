interface IPaintPageSizeParams {
  height: number;
  type: 'size';
  width: number;
}
interface IPaintPageHistoryParams {
  id: string;
  type: 'history';
  uid: string;
}
interface IPaintPageUploadParams {
  type: 'upload';
}
type IPaintPageParams = IPaintPageSizeParams | IPaintPageHistoryParams | IPaintPageUploadParams;

const buildParams = (params: any) => {
  return Object.entries(params)
    .map(([name, value]) => `${name}=${value}`)
    .join('&');
};

export const paintPage = (params?: IPaintPageParams) => {
  const path = '/paint';
  if (!params) {
    return path;
  } else {
    return `${path}?${buildParams(params)}`;
  }
};

export const uploadImagePage = '/upload';
