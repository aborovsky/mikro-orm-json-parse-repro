# How to reproduce

- docker compose up -d
- npm i
- npm run test
- check failed test: 
```text
  ● test json field parse

    expect(received).toEqual(expected) // deep equality

    - Expected  - 8
    + Received  + 2

      Array [
        Object {
          "id": 1,
    -     "jsonArray": Array [
    -       "foo",
    -       "bar",
    -     ],
    -     "jsonObj": Object {
    -       "bar": "abc",
    -       "foo": 2,
    -     },
    +     "jsonArray": "[\"foo\",\"bar\"]",
    +     "jsonObj": "{\"foo\":2,\"bar\":\"abc\"}",
        },
      ]
```