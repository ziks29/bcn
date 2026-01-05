export enum OrderStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export enum ContentStatus {
    PUBLISHED = 'PUBLISHED',
    PENDING = 'PENDING',
    DRAFT = 'DRAFT'
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'В ожидании',
    [OrderStatus.ACTIVE]: 'Активный',
    [OrderStatus.COMPLETED]: 'Завершён',
    [OrderStatus.CANCELLED]: 'Отменён'
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Наличные',
    [PaymentMethod.CARD]: 'Карта',
    [PaymentMethod.BANK_TRANSFER]: 'Перевод'
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    [TransactionType.INCOME]: 'Доход',
    [TransactionType.EXPENSE]: 'Расход'
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
    [ContentStatus.PUBLISHED]: 'Опубликовано',
    [ContentStatus.PENDING]: 'На рассмотрении',
    [ContentStatus.DRAFT]: 'Черновик'
}
