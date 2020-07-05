import javax.swing.*;
import java.awt.*;

public class Run extends JFrame implements AR {
  private JPanel body = null;
  private Component spacer = null;
  GridBagLayout layout = null;
  Run(){
    super("Project Creator");
    setDefaultCloseOperation(EXIT_ON_CLOSE);
    setSize(300,300);
    add(new AddOptions(this), BorderLayout.SOUTH);
    this.body = new JPanel();
    layout = new GridBagLayout();
    body.setLayout(layout);
    add(new JScrollPane(body),BorderLayout.CENTER);
    spacer = Box.createVerticalGlue();
    body.add(spacer);
    setSpacerConstraints(0);
    setVisible(true);
  }
  private void setSpacerConstraints(int y){
    GridBagConstraints c = new GridBagConstraints();
    c.weightx = 1;
    c.weighty = 1;
    c.fill = c.BOTH;
    c.anchor = c.CENTER;
    c.gridx = 0;
    c.gridy = y;
    layout.setConstraints(spacer,c);
  }
  public static void main(String[] args) {
    new Run();
  }
  private int count = 0;
  @Override
  public void add(Section s) {

    GridBagConstraints c = new GridBagConstraints();
    c.weightx = 1;
    c.weighty = 0;
    c.fill = c.HORIZONTAL;
    c.anchor = c.CENTER;
    c.gridx = 0;
    c.gridy = count;
    count += 1;
    body.add(s,c);
    setSpacerConstraints(count);
    body.revalidate();
    body.repaint();
  }

  @Override
  public void remove(Section c) {

    body.remove(c);
    body.revalidate();
    body.repaint();
  }
}

class AddOptions extends JPanel{
  AddOptions(AR it){
    add(new TitleSection().getAddButton(it));
    add(new TextSection().getAddButton(it));
  }
}
