// // widgetsData.js
export const widgets = [
  {
    i: "barChart1",
    x: 0, y: 0, w: 4, h: 4,
    type: "barChart",
    settings: {
      manualData: [
        { label: "Jan", value: 120 },
        { label: "Feb", value: 90 },
        { label: "Mar", value: 140 },
        { label: "Apr", value: 80 },
      ],
      style: {
        backgroundColor: "#ffffff",
        barColor: "#4caf50",
        textColor: "#333",
        fontSize: "14px"
      }
    }
  },
  {
    i: "table1",
    x: 4, y: 0, w: 4, h: 4,
    type: "table",
    settings: {
      manualData: [
        { Name: "Alice", Age: 25, Role: "Developer" },
        { Name: "Bob", Age: 30, Role: "Designer" },
        { Name: "Charlie", Age: 28, Role: "Manager" }
      ],
      style: {
        backgroundColor: "#fff",
        headerColor: "#007bff"
      }
    }
  },
  {
    i: "table2",
    x: 5, y: 3, w: 4, h: 4,
    type: "table",
    settings: {
      manualData: [
        { Name: "Alice", Age: 25, Role: "Developer" },
        { Name: "Bob", Age: 30, Role: "Designer" },
        { Name: "Charlie", Age: 28, Role: "Manager" }
      ],
      style: {
        backgroundColor: "#fff",
        headerColor: "#007bff"
      }
    }
  },
  
  {
    i: "card1",
    x: 8, y: 0, w: 4, h: 2,
    type: "card",
    settings: {
      title: "Total Sales",
      value: "$12,450",
      style: {
        backgroundColor: "#ffc107",
        textColor: "#000",
        fontSize: "18px"
      }
    }
  },
  {
    i: "lineChart1",
    x: 8, y: 2, w: 4, h: 4,
    type: "lineChart",
    settings: {
      manualData: [
        { label: "Week 1", value: 20 },
        { label: "Week 2", value: 45 },
        { label: "Week 3", value: 35 },
        { label: "Week 4", value: 50 }
      ],
      style: {
        backgroundColor: "#ffffff",
        lineColor: "#ff5722"
      }
    }
  }
];

// export const widgets = [
//     {
//     "w": 4,
//     "h": 7,
//     "x": 0,
//     "y": 0,
//     "i": "table1",
//     "moved": false,
//     "static": false,
//         "id": "1755070775938",
//         "type": "Table",
//         "settings": {
//             "manualData": [{
//                 "_id": "63f61caea152702f2c766bc9",
//                 "contactInfoId": "63f61caea152702f2c766bc8",
//                 "title": "hello how can we help you",
//                 "description": "thinking about buying a new home",
//                 "mobile": 1234567890,
//                 "countryCode": 91,
//                 "email": "care@iiflonehome.com",
//                 "facebookLink": "https://www.facebook.com/IIFLHomeLoans",
//                 "instagramLink": "https://www.instagram.com/iiflhomeloan",
//                 "linkedInLink": "https://www.linkedin.com/company/iifl-home-loans/mycompany",
//                 "createdAt": 1677073582922,
//                 "updatedAt": 1677135581521,
//                 "__v": 0,
//                 "appStoreLink": "https://www.apple.com/in/app-store/",
//                 "playStoreLink": "https://play.google.com/store/games?device=windows&hl=en-IN"
//             }]
//         }
//     },
//     {
       
//     "w": 6,
//     "h": 6,
//     "x": 5,
//     "y": 1,
//     "i": "barChart1",
//     "moved": false,
//     "static": false,
//         "id": "1755070789593",
//         "type": "Chart",
//         "settings": {
//             "manualData": [
//   { "label": "January", "value": 120 },
//   { "label": "February", "value": 90 },
//   { "label": "March", "value": 140 },
//   { "label": "April", "value": 80 },
//   { "label": "May", "value": 160 },
//   { "label": "June", "value": 110 }
// ]

//         }
//     }
// ]

// export const widgets = [
//   {
//     w: 4,
//     h: 7,
//     x: 0,
//     y: 0,
//     i: "table1",
//     moved: false,
//     static: false,
//     id: "1755070775938",
//     type: "Table",
//     settings: {
//       manualData: [
//         {
//           _id: "63f61caea152702f2c766bc9",
//           contactInfoId: "63f61caea152702f2c766bc8",
//           title: "hello how can we help you",
//           description: "thinking about buying a new home",
//           mobile: 1234567890,
//           countryCode: 91,
//           email: "care@iiflonehome.com",
//           facebookLink: "https://www.facebook.com/IIFLHomeLoans",
//           instagramLink: "https://www.instagram.com/iiflhomeloan",
//           linkedInLink: "https://www.linkedin.com/company/iifl-home-loans/mycompany",
//           createdAt: 1677073582922,
//           updatedAt: 1677135581521,
//           __v: 0,
//           appStoreLink: "https://www.apple.com/in/app-store/",
//           playStoreLink: "https://play.google.com/store/games?device=windows&hl=en-IN"
//         }
//       ]
//     }
//   },
//   {
//     w: 6,
//     h: 6,
//     x: 5,
//     y: 1,
//     i: "barChart1",
//     moved: false,
//     static: false,
//     id: "1755070789593",
//     type: "Chart",
//     settings: {
//       manualData: [
//         { label: "January", value: 120 },
//         { label: "February", value: 90 },
//         { label: "March", value: 140 },
//         { label: "April", value: 80 },
//         { label: "May", value: 160 },
//         { label: "June", value: 110 }
//       ]
//     }
//   }
// ];

