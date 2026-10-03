import { makeToolRoute } from "@/components/tool/route-factory";

const route = makeToolRoute("productivity");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
