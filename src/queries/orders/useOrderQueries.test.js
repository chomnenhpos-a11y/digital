import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
import { saleFormSchema } from "../../admin/features/SalesForm/schemas/saleFormSchema.js";

const http = { post: mock.fn(), put: mock.fn(), get: mock.fn(), delete: mock.fn() };
const invalidateQueries = mock.fn();
const cancelQueries = mock.fn();
const setQueriesData = mock.fn();
const removeQueries = mock.fn();

mock.module("../../api/axiosClient.js", { defaultExport: http });
mock.module("../../lib/alert.js", { defaultExport: { fire: mock.fn() } });
mock.module("@tanstack/react-query", {
  namedExports: {
    useQuery: mock.fn(),
    useMutation: (options) => options,
    useQueryClient: () => ({ invalidateQueries, cancelQueries, setQueriesData, removeQueries }),
  },
});

// React Query is mocked so this exposes the hook's actual mutation options.
const {
  useCreateOrderMutation: createOrderMutation,
  useCreatePOSOrderMutation: createPOSOrderMutation,
  useDeleteOrderMutation: deleteOrderMutation,
} = await import("./useOrderQueries.js");
let storedOrder;
let createOverrides;

beforeEach(() => {
  createOverrides = {};
  storedOrder = { id: 42, orderNo: "ORD-42", status: "Pending", paymentStatus: "Unpaid" };
  for (const method of Object.values(http)) method.mock.resetCalls();
  for (const method of [invalidateQueries, cancelQueries, setQueriesData, removeQueries]) {
    method.mock.resetCalls();
  }

  http.post.mock.mockImplementation(async (_url, payload) => {
    storedOrder = { ...payload, id: 42, orderNo: "ORD-42", ...createOverrides };
    return { data: { data: { ...storedOrder } } };
  });
  http.put.mock.mockImplementation(async (_url, changes) => {
    storedOrder = { ...storedOrder, ...changes };
    // An update acknowledgement alone does not confirm persistence.
    return { data: { success: true } };
  });
  http.get.mock.mockImplementation(async () => ({ data: { data: { ...storedOrder } } }));
  http.delete.mock.mockImplementation(async () => ({ data: { success: true } }));
});

function checkout(status = "Delivering", paymentStatus = "Unpaid", createMutation = createOrderMutation) {
  return createMutation().mutationFn({
    shop_code: "test-shop",
    items: [{ id: 7, quantity: 2 }],
    delivery: 2,
    customerInfo: saleFormSchema.parse({
      phone: "012 345 678",
      address: "Phnom Penh",
      deliveryFee: 2,
      deliveryProviderId: "3",
      status,
      paymentStatus,
    }),
  });
}

for (const status of ["Pickup", "Delivering", "Completed", "Cancelled"]) {
  test(`saves ${status} when creation returns Pending`, async () => {
    createOverrides = { status: "Pending" };

    const order = await checkout(status);

    assert.equal(http.post.mock.callCount(), 1);
    assert.equal(http.post.mock.calls[0].arguments[1].status, status);
    assert.equal(http.put.mock.callCount(), 1);
    assert.deepEqual(http.put.mock.calls[0].arguments, [
      "api/orders?id=42",
      { status, paymentStatus: "Unpaid" },
    ]);
    assert.equal(http.get.mock.callCount(), 1);
    assert.equal(order.status, status);
    assert.equal(storedOrder.status, status);
  });
}

test("skips follow-up updates when creation saves both requested statuses", async () => {
  const order = await checkout("Completed", "Paid");

  assert.equal(order.status, "Completed");
  assert.equal(order.paymentStatus, "Paid");
  assert.equal(http.post.mock.callCount(), 1);
  assert.equal(http.put.mock.callCount(), 0);
  assert.equal(http.get.mock.callCount(), 0);
});

test("saves delivery and payment together when both were defaulted", async () => {
  createOverrides = { status: "Pending", paymentStatus: "Unpaid" };

  const order = await checkout("Completed", "Paid");

  assert.equal(http.put.mock.callCount(), 1);
  assert.deepEqual(http.put.mock.calls[0].arguments[1], {
    status: "Completed",
    paymentStatus: "Paid",
  });
  assert.equal(order.status, "Completed");
  assert.equal(order.paymentStatus, "Paid");
});

test("keeps the delivery status when only payment needs updating", async () => {
  createOverrides = { paymentStatus: "Unpaid" };

  const order = await checkout("Delivering", "Paid");

  assert.equal(order.status, "Delivering");
  assert.equal(order.paymentStatus, "Paid");
  assert.equal(http.put.mock.callCount(), 1);
  assert.equal(http.get.mock.callCount(), 1);
});

test("reports the existing order when the status update fails without recreating it", async () => {
  createOverrides = { status: "Pending" };
  http.put.mock.mockImplementation(async () => { throw new Error("Update failed"); });

  await assert.rejects(checkout(), (error) => {
    assert.equal(error.createdOrder.id, 42);
    assert.equal(error.createdOrder.status, "Pending");
    return true;
  });
  assert.equal(http.post.mock.callCount(), 1);
});

test("rejects an acknowledged update when the saved status is still Pending", async () => {
  createOverrides = { status: "Pending" };
  http.put.mock.mockImplementation(async () => ({ data: { success: true } }));

  await assert.rejects(checkout(), (error) => {
    assert.equal(error.createdOrder.id, 42);
    assert.equal(error.createdOrder.status, "Pending");
    return true;
  });
  assert.equal(http.post.mock.callCount(), 1);
  assert.equal(http.get.mock.callCount(), 1);
});

test("preserves the saved order when payment verification fails after delivery was saved", async () => {
  createOverrides = { status: "Pending", paymentStatus: "Unpaid" };
  http.put.mock.mockImplementation(async (_url, changes) => {
    storedOrder.status = changes.status;
    return { data: { success: true } };
  });

  await assert.rejects(checkout("Completed", "Paid"), (error) => {
    assert.equal(error.createdOrder.id, 42);
    assert.equal(error.createdOrder.status, "Completed");
    assert.equal(error.createdOrder.paymentStatus, "Unpaid");
    return true;
  });
  assert.equal(http.post.mock.callCount(), 1);
});

test("does not enforce staff status choices for customer checkout", async () => {
  createOverrides = { status: "Pending" };

  const order = await createOrderMutation().mutationFn({
    shop_code: "test-shop",
    items: [{ id: 7, quantity: 1 }],
    customerInfo: { phone: "+85512345678", address: "Phnom Penh" },
  });

  assert.equal(order.status, "Pending");
  assert.equal(http.post.mock.calls[0].arguments[0], "api/orders");
  assert.equal(http.put.mock.callCount(), 0);
});

test("does not retry creation after a create request fails", async () => {
  http.post.mock.mockImplementation(async () => { throw new Error("Create failed"); });

  await assert.rejects(checkout(), /Create failed/);
  assert.equal(http.post.mock.callCount(), 1);
  assert.equal(http.put.mock.callCount(), 0);
  assert.equal(createOrderMutation().retry, false);
});

test("refreshes orders and stock after checkout settles", async () => {
  await createOrderMutation().onSettled();

  assert.deepEqual(invalidateQueries.mock.calls.map((call) => call.arguments), [
    [{ queryKey: ["orders"] }],
    [{ queryKey: ["products"] }],
  ]);
});

test("POS checkout sends the sale to createPOSOrder with the selected statuses and items", async () => {
  const order = await checkout("Completed", "Paid", createPOSOrderMutation);

  assert.equal(http.post.mock.callCount(), 1);
  assert.deepEqual(http.post.mock.calls[0].arguments, [
    "/api/orders?type=pos",
    {
      shop_code: "test-shop",
      settingId: null,
      customerPhone: "+85512345678",
      customerAddress: "Phnom Penh",
      status: "Completed",
      paymentStatus: "Paid",
      deliveryFee: 2,
      deliveryProviderId: 3,
      items: [{ productId: 7, quantity: 2 }],
    },
  ]);
  assert.equal(order.id, 42);
  assert.equal(order.orderNo, "ORD-42");
  assert.equal(order.status, "Completed");
  assert.equal(order.paymentStatus, "Paid");
  assert.equal(http.put.mock.callCount(), 0);
});

test("POS checkout sends the effective unit price per item", async () => {
  await createPOSOrderMutation().mutationFn({
    shop_code: "test-shop",
    delivery: 0,
    items: [
      // discounted by a special staff/customer price
      { id: 7, quantity: 2, salePrice: 500, specialPrice: 450 },
      // product sale price without a special discount
      { id: 8, quantity: 1, salePrice: 100, specialPrice: null },
      // no price information — the backend prices it itself
      { id: 9, quantity: 1 },
    ],
    customerInfo: { phone: "+85512345678", address: "Phnom Penh" },
  });

  assert.equal(http.post.mock.callCount(), 1);
  assert.deepEqual(
    http.post.mock.calls[0].arguments[1].items,
    [
      { productId: 7, quantity: 2, price: 450 },
      { productId: 8, quantity: 1, price: 100 },
      { productId: 9, quantity: 1 },
    ],
  );
});

test("POS checkout still saves the requested statuses when creation defaults them", async () => {
  createOverrides = { status: "Pending", paymentStatus: "Unpaid" };

  const order = await checkout("Delivering", "Paid", createPOSOrderMutation);

  assert.equal(http.post.mock.callCount(), 1);
  assert.equal(http.post.mock.calls[0].arguments[0], "/api/orders?type=pos");
  assert.equal(http.put.mock.callCount(), 1);
  assert.equal(http.get.mock.callCount(), 1);
  assert.equal(order.status, "Delivering");
  assert.equal(order.paymentStatus, "Paid");
});

test("POS checkout reports a created order if status confirmation fails", async () => {
  createOverrides = { status: "Pending" };
  http.put.mock.mockImplementation(async () => { throw new Error("Update failed"); });

  await assert.rejects(checkout("Completed", "Unpaid", createPOSOrderMutation), (error) => {
    assert.equal(error.createdOrder.id, 42);
    return true;
  });
  assert.equal(http.post.mock.callCount(), 1);
  assert.equal(http.post.mock.calls[0].arguments[0], "/api/orders?type=pos");
});

test("a failed POS request is not retried through the regular create endpoint", async () => {
  http.post.mock.mockImplementation(async () => { throw new Error("POS unavailable"); });

  await assert.rejects(checkout("Completed", "Paid", createPOSOrderMutation), /POS unavailable/);
  assert.equal(http.post.mock.callCount(), 1);
  assert.equal(http.post.mock.calls[0].arguments[0], "/api/orders?type=pos");
  assert.equal(createPOSOrderMutation().retry, false);
});

test("POS checkout refreshes order and stock queries", async () => {
  await createPOSOrderMutation().onSettled();

  assert.deepEqual(invalidateQueries.mock.calls.map((call) => call.arguments), [
    [{ queryKey: ["orders"] }],
    [{ queryKey: ["products"] }],
  ]);
});

test("deletes a pending, unpaid order after checking the saved statuses", async () => {
  const result = await deleteOrderMutation().mutationFn({ orderId: 42 });

  assert.deepEqual(result, { success: true });
  assert.equal(http.get.mock.callCount(), 1);
  assert.equal(http.delete.mock.callCount(), 1);
  assert.deepEqual(http.get.mock.calls[0].arguments[0], "api/orders?id=42");
  assert.deepEqual(http.delete.mock.calls[0].arguments, ["api/orders?id=42"]);
  assert.equal(deleteOrderMutation().retry, false);
});

for (const status of ["Pending", "Pickup", "Delivering", "Completed", "Cancelled"]) {
  for (const paymentStatus of ["Unpaid", "Paid"]) {
    if (status === "Pending" && paymentStatus === "Unpaid") continue;

    test(`blocks deleting a saved ${status}, ${paymentStatus} order`, async () => {
      storedOrder = { ...storedOrder, status, paymentStatus };

      await assert.rejects(
        deleteOrderMutation().mutationFn({ orderId: 42 }),
        (error) => error.code === "ORDER_DELETE_NOT_ALLOWED",
      );
      assert.equal(http.delete.mock.callCount(), 0);
    });
  }
}

test("blocks deletion when status fields are missing", async () => {
  storedOrder = { id: 42 };

  await assert.rejects(
    deleteOrderMutation().mutationFn({ orderId: 42 }),
    (error) => error.code === "ORDER_DELETE_NOT_ALLOWED",
  );
  assert.equal(http.delete.mock.callCount(), 0);
});

test("blocks deletion if the fetched order does not match the requested ID", async () => {
  storedOrder.id = 99;

  await assert.rejects(
    deleteOrderMutation().mutationFn({ orderId: 42 }),
    (error) => error.code === "ORDER_DELETE_NOT_ALLOWED",
  );
  assert.equal(http.delete.mock.callCount(), 0);
});

test("blocks deletion when the current order cannot be checked", async () => {
  http.get.mock.mockImplementation(async () => { throw new Error("Read failed"); });

  await assert.rejects(deleteOrderMutation().mutationFn({ orderId: 42 }), /Read failed/);
  assert.equal(http.delete.mock.callCount(), 0);
});

test("does not send requests for an empty order ID", async () => {
  await assert.rejects(deleteOrderMutation().mutationFn({ orderId: null }), /order ID is required/);

  assert.equal(http.get.mock.callCount(), 0);
  assert.equal(http.delete.mock.callCount(), 0);
});

test("keeps orders in the cache while deletion is pending or fails", async () => {
  const mutation = deleteOrderMutation();
  await mutation.onMutate({ orderId: 42 });
  assert.deepEqual(cancelQueries.mock.calls[0].arguments, [{ queryKey: ["orders", "list"] }]);
  assert.equal(setQueriesData.mock.callCount(), 0);

  http.delete.mock.mockImplementation(async () => { throw new Error("Delete failed"); });
  await assert.rejects(mutation.mutationFn({ orderId: 42 }), /Delete failed/);
  await mutation.onSettled();

  assert.equal(setQueriesData.mock.callCount(), 0);
  assert.equal(removeQueries.mock.callCount(), 0);
  assert.deepEqual(invalidateQueries.mock.calls[0].arguments, [{ queryKey: ["orders"] }]);
});

test("rejects an API failure response instead of treating it as a deletion", async () => {
  http.delete.mock.mockImplementation(async () => ({ data: { success: false, message: "Delete denied" } }));

  await assert.rejects(deleteOrderMutation().mutationFn({ orderId: 42 }), /Delete denied/);
  assert.equal(setQueriesData.mock.callCount(), 0);
});

test("removes a deleted order from every cached list and refreshes order and product data", async () => {
  const mutation = deleteOrderMutation();
  const response = await mutation.mutationFn({ orderId: 42 });
  await mutation.onSuccess(response, { orderId: 42 });
  await mutation.onSettled();

  const [filter, updateList] = setQueriesData.mock.calls[0].arguments;
  assert.deepEqual(filter, { queryKey: ["orders", "list"] });
  assert.deepEqual(updateList([{ id: "42" }, { id: 43 }]), [{ id: 43 }]);
  assert.deepEqual(updateList([{ id: 41 }, { id: 42 }]), [{ id: 41 }]);
  assert.equal(updateList(undefined), undefined);
  assert.deepEqual(removeQueries.mock.calls[0].arguments, [
    { queryKey: ["orders", "detail", 42], exact: true },
  ]);
  assert.deepEqual(invalidateQueries.mock.calls.map((call) => call.arguments), [
    [{ queryKey: ["products"] }],
    [{ queryKey: ["orders"] }],
  ]);
});
