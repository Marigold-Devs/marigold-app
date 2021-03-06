import { formatDateTime, formatInPeso } from 'globals/functions';
import { upperFirst, upperCase } from 'lodash';
import moment from 'moment';

export const printOrderSlip = (preorder, unitTypes) => {
  const products = preorder.preorder_products.map((preorderProduct) => {
    const unitTypeName = unitTypes.find(
      ({ id }) => id === preorderProduct.unit_type_id
    ).name;

    return {
      name: `${preorderProduct.product.name} (${unitTypeName})`,
      quantity: preorderProduct.quantity,
    };
  });

  const data = `
		<div style="width: 430pt; font-family: 'Courier', Geneva, Tahoma, sans-serif; font-size: 10pt; line-height: 125%">
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
				</tr>
				<tr>
          <td style="width: 200pt; font-weight: bold;">Supplier Telephone:</td>
          <td>${preorder?.supplier?.landline || ''}</td>
				</tr>
        <tr>
          <td style="width: 200pt; font-weight: bold;">Supplier Address:</td>
          <td>${preorder?.supplier?.address}</td>
				</tr>
        <tr>
          <td style="width: 200pt; font-weight: bold;">Supplier Description:</td>
          <td>${preorder?.supplier?.description}</td>
				</tr>
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

  return data;
};

export const printDeliverySlip = (delivery) => {
  const colors = {
    BLACK: '#000',
    BLUE: '#3498DB',
    GREEN: '#50C878',
    PURPLE: '#6A0DAD',
    RED: '#E74C3C',
  };
  const MAX_PRODUCTS_IN_PAGE = 21;
  const productsInPage = delivery.delivery_products.length + 1; // +1 for total row
  const isDifferentPage = productsInPage > MAX_PRODUCTS_IN_PAGE;

  let total = 0;
  const productsHtml = [
    ...delivery.delivery_products.map((deliveryProduct) => {
      const subtotal =
        Number(deliveryProduct.quantity) * Number(deliveryProduct.price);
      total += subtotal;

      return `
    <tr>
      <td>${deliveryProduct.quantity}</td>
      <td>${upperCase(deliveryProduct.unit_type.name)}</td>
      <td>${upperCase(deliveryProduct.product.name)}</td>
      <td>${formatInPeso(deliveryProduct.price, 'P')}</td>
      <td>${formatInPeso(subtotal, 'P')}</td>
    </tr>
    `;
    }),
    `<tr>
      <td></td>
      <td></td>
      <td><b>TOTAL: </b></td>
      <td></td>
      <td>${formatInPeso(total, 'P')}</td>
    </tr>
    `,
  ].join('');

  const generateHtml = ({ color }) => `
    <div style="min-height: ${
      isDifferentPage ? '1324px' : 'auto'
    }; color: ${color} !important; border-color: ${color}; font-size: 11px !important;">

      <div class="header">
        <div class="header-text font-weight-bold">DELIVERY RECEIPT - #${
          delivery.id
        }</div>
        <div>
          <strong>ORDERED BY:</strong>
        </div>
        <div>
          <span class="text-center font-weight-bold">
            ${delivery.customer.name}
          </span>
        </div>
        <div>
          <strong>DATE: </strong>
        </div>
        <div>
          <span class="text-center">
            ${moment(delivery.datetime_created).format('MMM DD, YYYY')}
          </span>
        </div>
        <div>
          <strong>ADDRESS:</strong>
        </div>
        <div>
          <span class="text-center">
            ${delivery.customer.address}
          </span>
        </div>
        <div>
          <strong>RECEIVED BY:</strong>
        </div>
        <div>
          <span class="text-center">
            ${delivery.user.first_name} ${delivery.user.last_name}
          </span>
        </div>
        <div>
          <strong>TIME:</strong>
        </div>
        <div>
          <span class="text-center">
            ${moment(delivery.datetime_created).format('hh:mm A')}
          </span>
        </div>
        <div>
          <strong>CONTACT NO:</strong>
        </div>
        <div>
          <span class="text-center">
            ${delivery.customer.phone || ''} ${delivery.customer.landline || ''}
          </span>
        </div>
      </div>

      <div class="products">
        <table>
          <tr>
            <th colspan="2">QUANTITY</th>
            <th>ARTICLES</th>
            <th>UNIT PRICE</th>
            <th>AMOUNT</th>
          </tr>
          ${productsHtml}
        </table>
      </div>

      <div class="footer">
        <div>
          <div>Receive the above goods in good order and conditions.</div>
          <div class="signature"></div>
          <div class="signature-label">Customer's Complete Name & Signature</div>
        </div>

        <div class="users">
          <div>
            <strong>PREPARED BY:</strong>
          </div>
          <div>
            <span></span>
          </div>
          <div>
            <strong>CHECKED BY:</strong>
          </div>
          <div>
            <span></span>
          </div>
          <div>
            <strong>PULLED-OUT BY:</strong>
          </div>
          <div>
            <span></span>
          </div>
          <div>
            <strong>DELIVERED BY:</strong>
          </div>
          <div>
            <span></span>
          </div>
        </div>

        <div class="disclaimer">
          NOTE: This order slip at the same time serves as the temporary delivery
          receipt. Our official invoice will be issued upon return of the receipt
          and fully signed by the customer.
        </div>
      </div>

      <div class="note">
        <span>BLACK = CUSTOMER'S COPY</span>
        <span>${
          delivery.customer.is_bakery ? 'BLUE' : 'RED'
        } = DELIVERY'S COPY</span>
        <span>PURPLE = MARIGOLD'S COPY</span>
      </div>
    </div>
  `;

  const data = `
  <html lang="en">
    <head>
      <style>
        .header, .products, .footer, .note {
          width: 795px;
        }
  
        .header {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-width: 1px;
          border-style: solid;
        }
  
        .header-text {
          grid-column: 1 / span 4;
          text-align: center;
        }
  
        .header > div {
          padding: 1px;
          border-top-width: 1px;
          border-top-style: solid;
        }
  
        .products table {
          width: 100%;
          border-collapse: collapse;
        }
  
        .products table th,
        .products table td {
          border-width: 1px;
          border-style: solid;
          text-align: center;
        }
  
        .footer {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
  
        .footer > div {
          padding: 2.5px;
          border-width: 1px;
          border-style: solid;
        }
  
        .footer .signature {
          width: 80%;
          margin: 15px auto 0;
          border-bottom-width: 1px;
          border-bottom-style: solid;
        }
  
        .footer .signature-label {
          text-align: center;
        }
  
        .footer .users {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }
  
        .footer .users span {
          width: 80%;
          height: 100%;
          margin: auto 0;
          display: block;
          border-bottom-width: 1px;
          border-bottom-style: solid;
        }
  
        .footer .disclaimer {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 10px;
          font-size: 10px;
        }
  
        .note {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
  
        .text-center {
          text-align: center;
        }
  
        .font-weight-bold {
          font-weight: bold;
        }
      </style>
    </head>
  
    <body>
      ${generateHtml({ color: colors.BLACK })}

      ${
        isDifferentPage
          ? ''
          : '<hr style="width: 795px; margin: 32px 0; border-style: dotted; border-width: 1px; border-color: #9A9A9A" />'
      }

      ${generateHtml({
        color: delivery.customer.is_bakery ? colors.BLUE : colors.RED,
      })}
      
      ${
        isDifferentPage
          ? ''
          : '<hr style="width: 795px; margin: 32px 0; border-style: dotted; border-width: 1px; border-color: #9A9A9A" />'
      }

      ${generateHtml({ color: colors.PURPLE })}
    </body>
  </html>
  `;

  return data;
};

// #50C878

// '#00A2FF'
