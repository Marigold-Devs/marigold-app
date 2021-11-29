import { formatDateTime } from 'globals/functions';
import { upperFirst } from 'lodash';

export const printOrderSlip = (preorder, unitTypes) => {
  const products = preorder.preorder_products.map((preorderProduct) => {
    const unitTypeName = unitTypes.find(
      ({ id }) => id === preorderProduct.unit_type_id
    ).name;

    return {
      name: `${preorderProduct.product_name} (${unitTypeName})`,
      quantity: preorderProduct.quantity,
    };
  });

  const data = `
		<div style="width: 430pt; font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 10pt; line-height: 100%">
			<div style="text-align: center;">
					<div style="font-size: 15pt;">Marigold Store</div>
					<div>[ORDER SLIP]</div>
			</div>

			<br />

			<table style="width: 100%;">
				<tr>
					<td style="width: 200pt; font-weight: bold;">Order ID:</td>
					<td>${preorder.id}</td>
				</tr>
				<tr>
					<td style="width: 200pt; font-weight: bold;">Created By:</td>
					<td>${preorder?.user?.first_name} ${preorder?.user?.last_name}</td>
				</tr>
				<tr>
					<td style="width: 200pt; font-weight: bold;">Delivery Type:</td>
					<td>${upperFirst(preorder?.delivery_type)}</td>
				</tr>
                <tr>
					<td style="width: 200pt; font-weight: bold;">Datetime Created:</td>
					<td>${formatDateTime(preorder?.datetime_created)}</td>
				</tr>
			</table>

			<br />

            <table style="width: 100%;">
				<tr>
					<td style="width: 200pt; font-weight: bold;">Supplier Name:</td>
					<td>${preorder?.supplier?.name}</td>
				</tr>
				<tr>
                    <td style="width: 200pt; font-weight: bold;">Supplier Phone:</td>
                    <td>${preorder?.supplier?.phone || ''}</td>
				<tr>
				<tr>
                    <td style="width: 200pt; font-weight: bold;">Supplier Telephone:</td>
                    <td>${preorder?.supplier?.landline || ''}</td>
				<tr>
                <tr>
                    <td style="width: 200pt; font-weight: bold;">Supplier Address:</td>
                    <td>${preorder?.supplier?.address}</td>
				<tr>
                <tr>
                    <td style="width: 200pt; font-weight: bold;">Supplier Description:</td>
                    <td>${preorder?.supplier?.description}</td>
				<tr>
			</table>

			<br />

			<table style="width: 100%;">
				<thead>
					<tr>
						<th style="text-align: left">Name</th>
						<th style="text-align: center">Quantity</th>
					</tr>
				</thead>  
				<tbody>
					${products
            .map(
              (product) => `	
                        <tr>
                            <td style="width: 200pt;">${product.name}</td>
                            <td style="text-align: center">${product.quantity}</td>
                        </tr>`
            )
            .join('')}
				</tbody>
			</table>			
		</div>
	`;

  console.log(data);

  return data;
};
