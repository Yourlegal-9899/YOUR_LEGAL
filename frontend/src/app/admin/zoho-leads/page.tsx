import Script from "next/script";
import { AdminFlow } from "@/components/admin/admin-flow";

export default function AdminZohoLeadsPage() {
  return (
    <>
      <AdminFlow activeView="zoho-leads" />
      <Script id="zohosalesiq-inline" strategy="afterInteractive">
        {`window.$zoho=window.$zoho || {}; $zoho.salesiq=$zoho.salesiq||{ready:function(){}}`}
      </Script>
      <Script
        id="zohosalesiq-script"
        src="https://salesiq.zohopublic.com/widget?wc=siq13df686271189514772566934b81611fc6e6a543d94e608f31bb19265ee9b474"
        strategy="afterInteractive"
      />
    </>
  );
}
