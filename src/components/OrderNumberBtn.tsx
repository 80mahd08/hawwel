import { Button } from "@chakra-ui/react";

function OrderNumberBtn({ telephone }: { telephone: string }) {
  console.log(telephone);

  return <Button className="btn">Order Number</Button>;
}

export default OrderNumberBtn;
