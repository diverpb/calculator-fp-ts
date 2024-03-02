type Props = { text: string };

export const InputText = ({ text }: Props) => {
  return <pre className="input-text">{text}</pre>;
};
