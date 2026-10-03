import { makeToolRoute } from "@/components/tool/route-factory";

const route = makeToolRoute("developer");

export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
