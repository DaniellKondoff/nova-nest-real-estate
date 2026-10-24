import { operationLanding } from "../../_landing/operation-landing";

// Landing pages for "имоти под наем" searches – ISR, purged on admin listing changes
export const revalidate = 3600;

const landing = operationLanding("rent");

export const generateStaticParams = landing.generateStaticParams;
export const generateMetadata = landing.generateMetadata;
export default landing.Page;
