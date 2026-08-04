// Database for Tiny House Web Application & Admin CMS
import { REAL_BUILDINGS, REAL_ROOMS } from './realData';

export const INITIAL_BUILDINGS = REAL_BUILDINGS;
export const INITIAL_ROOMS = REAL_ROOMS;

export const INITIAL_BOOKINGS = [
  {
    id: "BK-1001",
    customerName: "Nguyễn Văn An",
    phone: "0981234567",
    email: "an.nguyen@gmail.com",
    buildingCode: "TN007",
    roomNumber: "201",
    appointmentDate: "2026-08-06",
    appointmentTime: "10:30",
    status: "Chờ xác nhận",
    createdAt: "2026-08-04"
  },
  {
    id: "BK-1002",
    customerName: "Trần Thị Mai",
    phone: "0978901234",
    email: "mai.tt@gmail.com",
    buildingCode: "TN006",
    roomNumber: "Studio Tây Hồ",
    appointmentDate: "2026-08-05",
    appointmentTime: "15:00",
    status: "Đã xác nhận",
    createdAt: "2026-08-03"
  }
];

export const INITIAL_CTVS = [
  {
    id: "CTV-01",
    name: "Nguyễn Hoàng Nam",
    type: "Dân cư của Tiny House",
    phone: "0901112233",
    email: "nam.nh@gmail.com",
    commissionRate: "15%",
    balance: "1.500.000 VND",
    totalDeals: 3
  },
  {
    id: "CTV-02",
    name: "Lê Minh Tú",
    type: "Sale out source",
    phone: "0912223344",
    email: "tu.lm@outsourcesale.vn",
    commissionRate: "25%",
    balance: "4.200.000 VND",
    totalDeals: 8
  },
  {
    id: "CTV-03",
    name: "Phạm Quang Anh",
    type: "Sale nội bộ",
    phone: "0923334455",
    email: "anh.pq@tinyhouse.vn",
    commissionRate: "30%",
    balance: "8.600.000 VND",
    totalDeals: 15
  },
  {
    id: "CTV-04",
    name: "Hoàng Thu Thảo",
    type: "CTV đơn lẻ",
    phone: "0934445566",
    email: "thao.htt@gmail.com",
    commissionRate: "10%",
    balance: "800.000 VND",
    totalDeals: 1
  }
];

export const INITIAL_BLOGS = [
  {
    id: "blog-1",
    title: "5 Bí quyết chọn phòng trọ an toàn và 100% đạt chuẩn PCCC tại Hà Nội",
    category: "Kinh nghiệm thuê phòng",
    date: "02/08/2026",
    summary: "Những tiêu chuẩn bắt buộc về PCCC, thang thoát hiểm và thiết bị Sprinkler tự động giúp bạn an tâm sinh sống.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "blog-2",
    title: "Tiny Houses ra mắt chuỗi 19+ tòa nhà vận hành trực tiếp tại Thanh Xuân & Hà Đông",
    category: "Tin tức Tiny Houses",
    date: "28/07/2026",
    summary: "Chuỗi căn hộ dịch vụ cao cấp, niêm yết giá công khai và dịch vụ bảo trì kỹ thuật 24/7.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "blog-3",
    title: "Tuyển dụng 50+ CTV Sale phòng làm việc linh hoạt, hoa hồng hấp dẫn lên tới 30%",
    category: "Tuyển dụng",
    date: "20/07/2026",
    summary: "Cơ hội gia tăng thu nhập vượt trội cùng hệ sinh thái cho thuê vận hành bởi Tiny Houses.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
  }
];
